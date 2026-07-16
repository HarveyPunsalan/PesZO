import { prisma } from '../../config/database';
import { AppError } from '../../utils/response';
import { createLogger } from '../../lib/logger';
import { PlayerService } from '../player/player.service';
import { MarketsService } from '../markets/markets.service';
import { BuyInput, SellInput, BuyOutput, SellOutput, PortfolioHolding, TransactionOutput } from './portfolio.types';

const logger = createLogger('portfolio-service');

export class PortfolioService {
  private playerService: PlayerService;
  private marketsService: MarketsService;

  constructor(playerService: PlayerService, marketsService: MarketsService) {
    this.playerService = playerService;
    this.marketsService = marketsService;
  }

  /**
   * CASH has a fixed price of 1 and is never traded as a speculative asset.
   * Every buy/sell of a non-CASH asset produces two linked Transaction rows -
   * one against CASH and one against the target - inside a single transaction.
   */
  private async getCashAssetId(): Promise<string> {
    const cashAsset = await this.marketsService.getAssetByTicker('CASH');
    return cashAsset.id;
  }

  private toHolding(portfolio: { quantity: number; avg_buy_price: number; asset: { ticker: string; name: string; current_price: number } }): PortfolioHolding {
    const market_value = portfolio.quantity * portfolio.asset.current_price;
    const unrealized_pnl = (portfolio.asset.current_price - portfolio.avg_buy_price) * portfolio.quantity;

    return {
      ticker: portfolio.asset.ticker,
      name: portfolio.asset.name,
      quantity: portfolio.quantity,
      avg_buy_price: portfolio.avg_buy_price,
      current_price: portfolio.asset.current_price,
      market_value,
      unrealized_pnl,
    };
  }

  private toTransactionOutput(transaction: { id: string; type: string; quantity: number; price_at_time: number; total_amount: number; month: number; year: number; created_at: Date; asset: { ticker: string; name: string } }): TransactionOutput {
    return {
      id: transaction.id,
      asset_ticker: transaction.asset.ticker,
      asset_name: transaction.asset.name,
      type: transaction.type,
      quantity: transaction.quantity,
      price_at_time: transaction.price_at_time,
      total_amount: transaction.total_amount,
      month: transaction.month,
      year: transaction.year,
      created_at: transaction.created_at,
    };
  }

  /** Buy a non-CASH asset. CASH is decremented, target asset is upserted. */
  async buy(userId: string, data: BuyInput): Promise<BuyOutput> {
    if (data.ticker === 'CASH') {
      throw new AppError('Cannot buy CASH directly', 400);
    }

    const player = await this.playerService.getProfile(userId);
    const targetAsset = await this.marketsService.getAssetByTicker(data.ticker);
    const cashAssetId = await this.getCashAssetId();

    const result = await prisma.$transaction(async (tx) => {
      // Read the player's CASH row - a missing row means zero balance
      const cashRow = await tx.portfolio.findUnique({
        where: { player_id_asset_id: { player_id: player.id, asset_id: cashAssetId } },
      });

      const cashQuantity = cashRow?.quantity ?? 0;
      const totalCost = data.quantity * targetAsset.current_price;

      if (cashQuantity < totalCost) {
        throw new AppError('Insufficient funds', 400);
      }

      // Decrement CASH - never delete, even at zero, because it is the
      // player's persistent wallet, not a tradeable position.
      // cashRow is guaranteed non-null here: the insufficient-funds
      // check above throws when cashQuantity (0 if null) < totalCost.
      await tx.portfolio.update({
        where: { id: cashRow!.id },
        data: { quantity: cashRow!.quantity - totalCost },
      });

      // Record the CASH outflow
      const cashTransaction = await tx.transaction.create({
        data: {
          player_id: player.id,
          asset_id: cashAssetId,
          type: 'SELL',
          quantity: totalCost,
          price_at_time: 1,
          total_amount: totalCost,
          month: player.simulation_month,
          year: player.simulation_year,
        },
      });

      // Upsert the target asset holding
      const existingHolding = await tx.portfolio.findUnique({
        where: { player_id_asset_id: { player_id: player.id, asset_id: targetAsset.id } },
      });

      let holding;
      if (existingHolding) {
        const newQty = existingHolding.quantity + data.quantity;
        const newAvg = ((existingHolding.quantity * existingHolding.avg_buy_price) + (data.quantity * targetAsset.current_price)) / newQty;

        holding = await tx.portfolio.update({
          where: { id: existingHolding.id },
          data: { quantity: newQty, avg_buy_price: newAvg },
        });
      } else {
        holding = await tx.portfolio.create({
          data: {
            player_id: player.id,
            asset_id: targetAsset.id,
            quantity: data.quantity,
            avg_buy_price: targetAsset.current_price,
          },
        });
      }

      // Record the target asset inflow
      const targetTransaction = await tx.transaction.create({
        data: {
          player_id: player.id,
          asset_id: targetAsset.id,
          type: 'BUY',
          quantity: data.quantity,
          price_at_time: targetAsset.current_price,
          total_amount: totalCost,
          month: player.simulation_month,
          year: player.simulation_year,
        },
      });

      return { cashTransaction, targetTransaction, holding };
    });

    logger.info('Asset bought', { playerId: player.id, ticker: data.ticker, quantity: data.quantity });

    return {
      transaction: this.toTransactionOutput({ ...result.targetTransaction, asset: { ticker: targetAsset.ticker, name: targetAsset.name } }),
      holding: this.toHolding({ ...result.holding, asset: { ticker: targetAsset.ticker, name: targetAsset.name, current_price: targetAsset.current_price } }),
    };
  }

  /** Sell a non-CASH asset. Target asset is decremented/deleted, CASH is credited. */
  async sell(userId: string, data: SellInput): Promise<SellOutput> {
    if (data.ticker === 'CASH') {
      throw new AppError('Cannot sell CASH', 400);
    }

    const player = await this.playerService.getProfile(userId);
    const targetAsset = await this.marketsService.getAssetByTicker(data.ticker);
    const cashAssetId = await this.getCashAssetId();
    const totalAmount = data.quantity * targetAsset.current_price;

    const result = await prisma.$transaction(async (tx) => {
      // Read inside the transaction so two near-simultaneous sells
      // for the same holding cannot both read stale quantity and
      // corrupt the row
      const existingHolding = await tx.portfolio.findUnique({
        where: { player_id_asset_id: { player_id: player.id, asset_id: targetAsset.id } },
      });

      if (!existingHolding || existingHolding.quantity < data.quantity) {
        throw new AppError('Insufficient holdings', 400);
      }

      // Derived at sell time only - avg_buy_price gets overwritten by later
      // buys, so this value is not reconstructable from historical rows
      const realized_pnl = (targetAsset.current_price - existingHolding.avg_buy_price) * data.quantity;

      let updatedHolding: { quantity: number; avg_buy_price: number; asset: { ticker: string; name: string; current_price: number } } | null = null;

      // Full liquidation removes the row entirely; partial sell leaves
      // avg_buy_price untouched - cost basis only changes on buys
      if (data.quantity === existingHolding.quantity) {
        await tx.portfolio.delete({ where: { id: existingHolding.id } });
      } else {
        const updated = await tx.portfolio.update({
          where: { id: existingHolding.id },
          data: { quantity: existingHolding.quantity - data.quantity },
        });
        updatedHolding = { ...updated, asset: { ticker: targetAsset.ticker, name: targetAsset.name, current_price: targetAsset.current_price } };
      }

      // Record the target asset outflow
      const targetTransaction = await tx.transaction.create({
        data: {
          player_id: player.id,
          asset_id: targetAsset.id,
          type: 'SELL',
          quantity: data.quantity,
          price_at_time: targetAsset.current_price,
          total_amount: totalAmount,
          month: player.simulation_month,
          year: player.simulation_year,
        },
      });

      // Credit CASH - create if somehow absent
      const cashRow = await tx.portfolio.findUnique({
        where: { player_id_asset_id: { player_id: player.id, asset_id: cashAssetId } },
      });

      if (cashRow) {
        await tx.portfolio.update({
          where: { id: cashRow.id },
          data: { quantity: cashRow.quantity + totalAmount },
        });
      } else {
        await tx.portfolio.create({
          data: {
            player_id: player.id,
            asset_id: cashAssetId,
            quantity: totalAmount,
            avg_buy_price: 1,
          },
        });
      }

      // Record the CASH inflow
      const cashTransaction = await tx.transaction.create({
        data: {
          player_id: player.id,
          asset_id: cashAssetId,
          type: 'BUY',
          quantity: totalAmount,
          price_at_time: 1,
          total_amount: totalAmount,
          month: player.simulation_month,
          year: player.simulation_year,
        },
      });

      return { targetTransaction, cashTransaction, updatedHolding, realized_pnl };
    });

    logger.info('Asset sold', { playerId: player.id, ticker: data.ticker, quantity: data.quantity });

    return {
      transaction: this.toTransactionOutput({ ...result.targetTransaction, asset: { ticker: targetAsset.ticker, name: targetAsset.name } }),
      realized_pnl: result.realized_pnl,
      holding: result.updatedHolding ? this.toHolding(result.updatedHolding) : null,
    };
  }

  /** Fetch all holdings for a player with computed market value and unrealized PnL. */
  async getPortfolio(userId: string): Promise<PortfolioHolding[]> {
    const player = await this.playerService.getProfile(userId);

    const holdings = await prisma.portfolio.findMany({
      where: { player_id: player.id },
      include: { asset: true },
    });

    return holdings.map((h) => this.toHolding(h));
  }

  /** Fetch the transaction ledger for a player, optionally filtered by month/year. */
  async getTransactions(userId: string, month?: number, year?: number): Promise<TransactionOutput[]> {
    const player = await this.playerService.getProfile(userId);

    const where: { player_id: string; month?: number; year?: number } = { player_id: player.id };
    if (month !== undefined) where.month = month;
    if (year !== undefined) where.year = year;

    const transactions = await prisma.transaction.findMany({
      where,
      include: { asset: true },
      orderBy: { created_at: 'desc' },
    });

    return transactions.map((t) => this.toTransactionOutput(t));
  }
}

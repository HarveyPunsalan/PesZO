import { AppError } from '../../utils/response';
import { Asset, MarketHistory, MarketHistoryQuery } from './markets.types';

export class MarketsService {
  async getAssets(): Promise<Asset[]> {
    // TODO: implement when Markets module is built
    // This will use prisma.asset.findMany() to get all assets
    throw new AppError('Not implemented', 501);
  }

  async getAssetById(_id: string): Promise<Asset> {
    // TODO: implement when Markets module is built
    // This will use prisma.asset.findUnique() to get asset by id
    throw new AppError('Not implemented', 501);
  }

  async getMarketHistory(_query: MarketHistoryQuery): Promise<MarketHistory[]> {
    // TODO: implement when Markets module is built
    // This will use prisma.marketHistory.findMany() to get price history
    throw new AppError('Not implemented', 501);
  }
}

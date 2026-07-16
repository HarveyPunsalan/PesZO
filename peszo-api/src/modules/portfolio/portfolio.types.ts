export interface BuyInput {
  ticker: string;
  quantity: number;
}

export interface SellInput {
  ticker: string;
  quantity: number;
}

export interface PortfolioHolding {
  ticker: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
}

export interface TransactionOutput {
  id: string;
  asset_ticker: string;
  asset_name: string;
  type: string;
  quantity: number;
  price_at_time: number;
  total_amount: number;
  month: number;
  year: number;
  created_at: Date;
}

export interface BuyOutput {
  transaction: TransactionOutput;
  holding: PortfolioHolding;
}

export interface SellOutput {
  transaction: TransactionOutput;
  realized_pnl: number;
  holding: PortfolioHolding | null;
}

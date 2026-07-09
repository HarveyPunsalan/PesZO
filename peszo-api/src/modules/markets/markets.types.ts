export interface AssetOutput {
  id: string;
  name: string;
  ticker: string;
  type: string;
  trend_bias: number;
  volatility: number;
  current_price: number;
  created_at: Date;
  updated_at: Date;
}

export interface AssetWithHistory extends AssetOutput {
  price_history: PriceHistoryOutput[];
}

export interface PriceHistoryOutput {
  id: string;
  asset_id: string;
  price: number;
  month: number;
  year: number;
  created_at: Date;
}

export interface AssetTickInput {
  month: number;
  year: number;
}

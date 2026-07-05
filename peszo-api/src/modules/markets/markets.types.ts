export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  currentPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketHistory {
  id: string;
  assetId: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketHistoryQuery {
  assetId: string;
}

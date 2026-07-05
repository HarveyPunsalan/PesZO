export interface BuyAssetInput {
  assetId: string;
  quantity: number;
}

export interface SellAssetInput {
  assetId: string;
  quantity: number;
}

export interface Holding {
  id: string;
  userId: string;
  assetId: string;
  quantity: number;
  averagePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

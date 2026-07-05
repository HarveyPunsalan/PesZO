import { AppError } from '../../utils/response';
import { BuyAssetInput, SellAssetInput } from './portfolio.types';

export class PortfolioService {
  async getPortfolio(_userId: string) {
    // TODO: implement when Portfolio module is built
    // This will use prisma.holding.findMany() with include: { asset: true }
    throw new AppError('Not implemented', 501);
  }

  async buyAsset(_userId: string, _data: BuyAssetInput) {
    // TODO: implement when Portfolio module is built
    // This will use prisma.asset.findUnique() to get asset price
    // This will use prisma.holding.upsert() to add/update holding
    throw new AppError('Not implemented', 501);
  }

  async sellAsset(_userId: string, _data: SellAssetInput) {
    // TODO: implement when Portfolio module is built
    // This will use prisma.holding.findUnique() to check holdings
    // This will use prisma.holding.delete() or prisma.holding.update()
    throw new AppError('Not implemented', 501);
  }
}

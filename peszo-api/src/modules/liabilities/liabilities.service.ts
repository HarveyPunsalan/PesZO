import { AppError } from '../../utils/response';
import { AddLiabilityInput, MakePaymentInput } from './liabilities.types';

export class LiabilitiesService {
  async getLiabilities(_userId: string) {
    // TODO: implement when Liabilities module is built
    // This will use prisma.liability.findMany() to get all liabilities
    throw new AppError('Not implemented', 501);
  }

  async addLiability(_userId: string, _data: AddLiabilityInput) {
    // TODO: implement when Liabilities module is built
    // This will use prisma.liability.create() to add liability
    throw new AppError('Not implemented', 501);
  }

  async makePayment(_liabilityId: string, _data: MakePaymentInput) {
    // TODO: implement when Liabilities module is built
    // This will use prisma.liability.findUnique() to get liability
    // This will use prisma.liability.update() to update remaining balance
    throw new AppError('Not implemented', 501);
  }
}

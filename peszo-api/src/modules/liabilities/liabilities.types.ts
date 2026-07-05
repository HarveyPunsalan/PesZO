export interface AddLiabilityInput {
  name: string;
  type: 'loan' | 'credit_card' | 'mortgage' | 'other';
  totalAmount: number;
  interestRate: number;
  minimumPayment: number;
}

export interface MakePaymentInput {
  amount: number;
}

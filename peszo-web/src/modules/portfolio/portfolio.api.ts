import api from "@/lib/axios";
import type { ApiResponse } from "@/lib/types";

export interface PortfolioHolding {
  ticker: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
}

/** GET /portfolio - returns all holdings with live current_price
 * joined from the Asset table; market_value and unrealized_pnl
 * are computed server-side. */
export const getPortfolioHoldings = async (): Promise<PortfolioHolding[]> => {
  const res = await api.get<ApiResponse<PortfolioHolding[]>>("/portfolio");
  return res.data.data;
};

export interface Transaction {
  id: string;
  asset_ticker: string;
  asset_name: string;
  type: string;
  quantity: number;
  price_at_time: number;
  total_amount: number;
  month: number;
  year: number;
  created_at: string;
}

/** GET /portfolio/transactions?month=&year= - returns the full transaction
 * ledger for the player (both CASH and asset rows), optionally filtered
 * by simulation month/year, ordered most recent first. */
export const getTransactions = async (
  month?: number,
  year?: number
): Promise<Transaction[]> => {
  const res = await api.get<ApiResponse<Transaction[]>>(
    "/portfolio/transactions",
    { params: { month, year } }
  );
  return res.data.data;
};

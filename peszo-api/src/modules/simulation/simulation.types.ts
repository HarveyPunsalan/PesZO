export interface SimulationOutput {
  id: string;
  player_id: string;
  month: number;
  year: number;
  inflation_rate: number;
  interest_rate: number;
  gdp_growth: number;
  unemployment_rate: number;
  exchange_rate: number;
  market_index: number;
  created_at: Date;
}

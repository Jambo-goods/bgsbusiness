
export interface PendingInvestment {
  projectId: string;
  projectName: string;
  amount: number;
  duration: number;
  yield: number;
  timestamp: string;
}

export interface InvestmentReturns {
  monthlyReturn: number;
  totalReturn: number;
}


export interface WalletChange {
  percentage: string;
  value: string;
}

export interface InvestmentChange {
  percentage: string;
  value: string;
}

export interface ProjectsChange {
  value: string;
}

export interface YieldChange {
  value: string;
}

export interface DashboardCardData {
  monthlyYield: number;
  annualYield: number;
  walletChange: WalletChange;
  investmentChange: InvestmentChange;
  projectsChange: ProjectsChange;
  yieldChange: YieldChange;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  investmentTotal: number;
  projectsCount: number;
  walletBalance?: number;
}

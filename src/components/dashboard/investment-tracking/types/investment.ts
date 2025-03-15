
export interface Investment {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  yield_rate: number;
  status: string;
  date: string;
  duration: number;
  end_date: string;
  remainingDuration: number;
  projects: {
    name: string;
    description: string;
    image: string;
    company_name: string;
    location: string;
    yield: number;
  };
  user_first_name: string;
  user_last_name: string;
}

export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  status: string;
  projectId: string;
  projectName: string;
  expectedCumulativeReturn?: number;
}

export interface InvestmentSubscription {
  id: string;
  amount: number;
  start_date: string;
  end_date: string | null;
  yield_rate: number;
  remaining_months: number;
  status: string;
  project: {
    id: string;
    name: string;
    image: string;
    yield: number;
  };
}

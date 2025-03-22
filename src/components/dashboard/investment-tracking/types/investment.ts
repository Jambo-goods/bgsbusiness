
export interface Investment {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  date: string;
  yield_rate: number;
  duration: number;
  end_date: string;
  status: string;
  user_first_name?: string;
  user_last_name?: string;
  remainingDuration?: number;
  projects: {
    name: string;
    description: string;
    category: string;
    status: string;
    image: string;
    funding_progress: number;
    yield: number;
  }
}

export interface Transaction {
  id: string;
  user_id: string;
  investment_id?: string;
  project_id?: string;
  amount: number;
  type: 'investment' | 'yield';
  created_at: string;
  status: 'pending' | 'completed';
  cumulativeAmount?: number;
}

export interface ScheduledPayment {
  id: string;
  project_id: string;
  payment_date: string;
  percentage: number;
  status: string;
  total_scheduled_amount: number;
  investors_count: number;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  total_invested_amount?: number;
  calculatedCumulativeAmount?: number;
  projects?: {
    name: string;
    image: string;
    status: string;
    company_name: string;
  };
}

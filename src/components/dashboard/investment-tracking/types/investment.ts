
export interface Investment {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  yield_rate: number;
  duration: number;
  date: string;
  status: 'active' | 'completed' | 'cancelled';
  projects?: {
    name: string;
    image: string;
    company_name: string;
    status: string;
    first_payment_delay_months?: number;
    category?: string;
    description?: string;
    funding_progress?: number;
  };
  payments?: Payment[];
  remainingDuration?: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'paid';
  description: string;
  userId: string;
  investmentId: string;
  percentage?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'yield' | 'investment';
  description: string;
  created_at: string;
  status: string;
  investment_id?: string;
}

export interface ScheduledPayment {
  id: string;
  project_id: string;
  payment_date: string;
  status: 'scheduled' | 'pending' | 'paid';
  percentage: number;
  total_scheduled_amount: number;
  processed_at?: string;
  created_at?: string;
  updated_at?: string;
  investors_count?: number;
  total_invested_amount?: number;
  projects?: {
    name: string;
    image?: string;
    company_name?: string;
    status?: string;
    first_payment_delay_months?: number;
  };
}

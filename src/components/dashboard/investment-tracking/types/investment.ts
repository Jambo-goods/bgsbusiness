
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
  };
  payments?: Payment[];
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

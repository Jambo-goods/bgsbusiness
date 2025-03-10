
export interface PaymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  date: Date;
  type: 'yield' | 'capital';
  status: 'paid' | 'pending' | 'scheduled';
  cumulativeAmount?: number;
}

export interface ScheduledPayment {
  id: string;
  user_id: string;
  project_id: string;
  investment_id: string | null;
  amount: number;
  payment_date: string;
  cumulative_amount: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  project?: {
    name: string;
    image: string;
  };
}

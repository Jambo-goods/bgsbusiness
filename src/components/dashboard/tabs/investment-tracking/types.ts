
export interface PaymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  date: Date;
  type: 'yield' | 'capital';
  status: 'paid' | 'pending' | 'scheduled';
  percentage?: number;  // Optional percentage field for scheduled payments
}

export interface ScheduledPayment {
  id: string;
  project_id: string;
  payment_date: string;
  percentage: number;
  status: 'scheduled' | 'pending' | 'paid';
  total_invested_amount: number;
  total_scheduled_amount: number;
  cumulative_amount: number;
  created_at?: string;
  updated_at?: string;
  investors_count?: number;
  processed_at?: string;
  projects?: { name: string }; // This is for the join from Supabase
}

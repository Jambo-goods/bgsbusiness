
export interface PaymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  date: Date;
  type: 'yield' | 'capital';
  status: 'paid' | 'pending' | 'scheduled';
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
}

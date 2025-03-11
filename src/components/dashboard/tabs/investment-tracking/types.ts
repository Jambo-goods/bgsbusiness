
export interface Investment {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  yield_rate: number;
  duration: number;
  status: string;
  date: string;
  end_date: string;
}

export interface ScheduledPayment {
  id: string;
  project_id: string;
  payment_date: string;
  percentage: number;
  status: "scheduled" | "pending" | "paid";
  total_scheduled_amount: number | null;
  investors_count: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  calculatedCumulativeAmount?: number;
  projects?: {
    name: string;
    image: string;
    company_name: string;
    status: string;
  };
}

export interface PaymentStatistics {
  totalScheduledAmount: number;
  paymentsReceived: number;
  percentageReceived: number;
  paymentsWithCumulative: ScheduledPayment[];
}

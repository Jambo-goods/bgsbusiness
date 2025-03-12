export interface Investment {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  date: string;
  yield_rate: number;
  status: string;
  project?: {
    name: string;
    yield: number;
    first_payment_delay_months?: number;
  };
}

export interface PaymentStatistics {
  totalScheduledAmount: number;
  paymentsReceived: number;
  paymentsWithCumulative: any[];
  percentageReceived: number;
  totalPaid: number;
  totalPending: number;
  averageMonthlyReturn: number;
  filteredAndSortedPayments: PaymentRecord[];
  cumulativeReturns: (PaymentRecord & { cumulativeReturn: number })[];
}

export interface PaymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  date: Date;
  type: 'yield' | 'capital';
  status: 'paid' | 'pending' | 'scheduled';
  percentage?: number;
  firstPaymentDelay?: number; // New field for first payment delay
}

export interface ScheduledPayment {
  id: string;
  project_id: string;
  payment_date: string;
  status: 'paid' | 'pending' | 'scheduled';
  percentage?: number;
  total_scheduled_amount?: number;
  total_invested_amount?: number;
  investors_count?: number;
  created_at: string;
  updated_at: string;
  projects?: {
    name: string;
    image: string;
    company_name: string;
    status: string;
    first_payment_delay_months?: number;
  };
  first_payment_delay_months?: number; // Added field for first payment delay
}

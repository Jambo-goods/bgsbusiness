
export type PaymentRecord = {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  date: Date;
  type: 'yield';
  status: 'paid' | 'pending' | 'scheduled';
  percentage?: number;
  isProjectedPayment?: boolean;
  expectedCumulativeReturn?: number;
};

export type ScheduledPayment = {
  id: string;
  project_id: string;
  payment_date: string;
  percentage?: number;
  status: string;
  total_scheduled_amount: number;
  investors_count: number;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  total_invested_amount?: number;
  projects?: {
    name: string;
    image: string;
    status: string;
    company_name: string;
  };
  calculatedCumulativeAmount?: number;
};

export type Investment = {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  date: string;
  status: 'active' | 'completed';
  yield_rate: number;
  projects: {
    id: string;
    name: string;
    yield: number;
    first_payment_delay_months: number;
  };
};

export type PaymentStatistics = {
  totalScheduledAmount: number;
  paymentsReceived: number;
  paymentsWithCumulative: ScheduledPayment[];
  percentageReceived: number;
  totalPaid: number;
  totalPending: number;
  averageMonthlyReturn: number;
  filteredAndSortedPayments: PaymentRecord[];
  cumulativeReturns: (PaymentRecord & { cumulativeReturn: number })[];
};

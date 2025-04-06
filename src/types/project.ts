
// src/types/project.ts
export interface Project {
  id: string;
  title: string;
  name?: string;
  min_investment: number;
  available_amount: number;
  yield_rate: number;
  yield?: number;
  risk_rating: number;
  category?: string;
  company_name?: string;
  created_at?: string;
  description?: string;
  duration?: string;
  end_date?: string;
  featured?: boolean;
  first_payment_delay_months?: number;
  funding_progress?: number;
}

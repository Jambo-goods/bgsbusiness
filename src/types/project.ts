
export interface Project {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
  amount?: number;
  duration?: number | string;
  yield_rate?: number;
  image_url?: string;
  image?: string; // Added for components that use image
  owner_id?: string;
  location?: string;
  risk_level?: string;
  min_investment?: number;
  minInvestment?: number; // Alias for min_investment for backward compatibility
  maxInvestment?: number; // Added for investment forms
  company_name?: string;
  companyName?: string; // Alias for company_name for backward compatibility
  investment_model?: string;
  // Project investment properties
  price?: number;
  profitability?: number;
  yield?: number;
  possible_durations?: number[];
  investedAmount?: number;
  investmentDate?: string;
  fundingProgress?: number;
  available_amount?: number;
  risk_rating?: string;
  // Partner-related fields
  partner_description?: string;
  partner_experience?: string;
  partner_employees?: number;
  partner_projects?: number;
  partner_satisfaction?: number;
  underlying_asset?: string;
  first_payment_delay_months?: number;
  firstPaymentDelayMonths?: number; // Alias for first_payment_delay_months
  [key: string]: any;
}


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
  owner_id?: string;
  location?: string;
  risk_level?: string;
  min_investment?: number;
  company_name?: string;
  investment_model?: string;
  // Partner-related fields
  partner_description?: string;
  partner_experience?: string;
  partner_employees?: number;
  partner_projects?: number;
  partner_satisfaction?: number;
  underlying_asset?: string;
  [key: string]: any;
}

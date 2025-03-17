
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  investment_total: number | null;
  projects_count: number | null;
  created_at: string | null;
  last_active_at: string | null;
  referral_code: string | null;
  address: string | null;
}

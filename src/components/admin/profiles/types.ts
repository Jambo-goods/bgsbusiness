
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  wallet_balance: number;
  projects_count: number;
  investment_total: number;
  created_at: string | null;
  last_active_at?: string | null;
  online_status?: 'online' | 'offline';
};

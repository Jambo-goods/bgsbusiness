
// Types for admin dashboard
export interface AdminStats {
  userCount: number;
  totalInvestments: number;
  totalProjects: number;
  pendingWithdrawals: number;
  ongoingProjects: number;
}

export interface AdminLog {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  admin_id: string;
  admin_users?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  updated_at: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
  investment_total: number | null;
  address: string | null;
  last_active_at?: string | null;
  account_status?: 'active' | 'inactive' | 'suspended';
  online_status?: 'online' | 'offline';
}


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

export type RealTimeStatus = 'connecting' | 'connected' | 'error';


export interface AdminStats {
  userCount: number;
  totalInvestments: number;
  totalProjects: number;
  pendingWithdrawals: number;
  ongoingProjects: number;
  totalWalletBalance: number;
  receivedTransfersCount: number;
  receivedTransfersAmount: number;
  withdrawalRequestsCount: number;
  withdrawalRequestsAmount: number;
}

export interface AdminLog {
  id: string;
  action: string;
  description: string;
  admin: {
    first_name?: string;
    last_name?: string;
  } | null;
  timestamp: Date;
  action_type?: string;
  created_at?: Date;
  admin_id?: string;
}

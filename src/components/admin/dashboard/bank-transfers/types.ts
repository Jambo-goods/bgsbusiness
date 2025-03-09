
export interface BankTransferItem {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  description: string;
  status: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export interface BankTransferTableProps {
  pendingTransfers: BankTransferItem[];
  isLoading: boolean;
  refreshData: () => void;
}

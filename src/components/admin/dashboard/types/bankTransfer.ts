
export interface BankTransferItem {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  description: string;
  status: string;
  receipt_confirmed?: boolean;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  reference?: string;
  processed?: boolean;
  processed_at?: string | null;
  notes?: string;
}

export interface BankTransferTableProps {
  pendingTransfers: BankTransferItem[];
  isLoading: boolean;
  refreshData: () => void;
}

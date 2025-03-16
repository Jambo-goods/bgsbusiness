
export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string | null;
  created_at: string;
  status: string;
  raw_timestamp?: string;
}

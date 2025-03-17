
export interface BankTransfer {
  id: string;
  amount: number | null;
  status: string | null;
  reference: string;
  confirmed_at: string | null;
  processed_at: string | null;
  notes: string | null;
  user_id: string;
}

export interface UserData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

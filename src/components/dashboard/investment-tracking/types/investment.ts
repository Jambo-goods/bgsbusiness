
export interface Investment {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  date: string;
  yield_rate: number;
  duration: number;
  end_date: string;
  status: string;
  user_first_name?: string;
  user_last_name?: string;
  remainingDuration?: number;
  projects: {
    name: string;
    description: string;
    category: string;
    status: string;
    image: string;
    funding_progress: number;
    yield: number;
  }
}

export interface Transaction {
  id: string;
  created_at: string;
  type: string;
  amount: number;
  status: string;
  user_id: string;
}

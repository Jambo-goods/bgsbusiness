
export interface Project {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
  amount?: number;
  duration?: number;
  yield_rate?: number;
  image_url?: string;
  owner_id?: string;
  location?: string;
  risk_level?: string;
  [key: string]: any;
}

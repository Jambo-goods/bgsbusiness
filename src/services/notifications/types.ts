import { Json } from "@/integrations/supabase/types";

export type NotificationType = 
  | 'deposit' | 'withdrawal' | 'investment' | 'security' | 'marketing';

export type NotificationCategory = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: NotificationType;
  category?: NotificationCategory;
  metadata?: Record<string, any>;
}

export interface NotificationCreateParams {
  title: string;
  description: string;
  type: NotificationType;
  category?: NotificationCategory;
  metadata?: Record<string, any>;
}

export const NotificationCategories = {
  deposit: { icon: 'wallet', title: 'Portefeuille' },
  withdrawal: { icon: 'wallet', title: 'Portefeuille' },
  investment: { icon: 'briefcase', title: 'Investissement' },
  security: { icon: 'shield', title: 'Sécurité' },
  marketing: { icon: 'megaphone', title: 'Actualités' },
};

export type NotificationData = {
  category?: NotificationCategory;
  amount?: number;
  reference?: string;
  transaction_id?: string;
  status?: string;
  [key: string]: any;
}

export interface DatabaseNotification {
  id: string;
  title: string;
  message: string;  // Used in DB instead of description
  type: string;
  user_id: string;
  created_at: string;
  seen: boolean;    // Used in DB instead of read
  data: NotificationData; // JSON in database
}

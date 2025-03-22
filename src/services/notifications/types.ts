
import { Json } from "@/integrations/supabase/types";

export type NotificationType = 
  | 'deposit'
  | 'withdrawal'
  | 'investment'
  | 'security'
  | 'marketing'
  | 'info';

export type NotificationCategory = 
  | 'info' 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'transaction';

export const NotificationCategories: Record<NotificationCategory, NotificationCategory> = {
  info: 'info',
  success: 'success',
  error: 'error',
  warning: 'warning',
  transaction: 'transaction'
};

export interface NotificationCreateParams {
  title: string;
  description: string;
  type: string;
  category?: NotificationCategory;
  metadata?: Record<string, any>;
}

export interface DatabaseNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  seen: boolean;
  created_at: string;
  data: Record<string, any> | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: string;
  category?: string;
  metadata: Record<string, any>;
}

// Add this to fix the error
export type NotificationData = Record<string, any>;

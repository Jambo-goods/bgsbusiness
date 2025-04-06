
import { Json } from "@/integrations/supabase/types";

export type NotificationType = 
  | 'deposit'
  | 'withdrawal'
  | 'investment'
  | 'security'
  | 'marketing'
  | 'system'
  | 'custom'
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
  userId?: string;
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

export type NotificationData = Record<string, any>;

export interface NotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(): Promise<boolean>;
  deleteNotification(notificationId: string): Promise<boolean>;
  deleteAllNotifications(): Promise<boolean>;
  getUnreadCount(): Promise<number>;
  createNotification(params: NotificationCreateParams): Promise<boolean>;
  
  // Withdrawal notification methods
  withdrawalScheduled(amount: number): Promise<void>;
  withdrawalValidated(amount: number): Promise<void>;
  withdrawalCompleted(amount: number): Promise<void>;
  withdrawalRejected(amount: number): Promise<void>;
  withdrawalReceived(amount: number): Promise<void>;
  withdrawalConfirmed(amount: number): Promise<void>;
  withdrawalPaid(amount: number): Promise<void>;
  
  // Investment notification methods
  investmentConfirmed(projectName: string, amount: number): Promise<void>;
}

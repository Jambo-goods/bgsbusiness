
// Basic notification type definitions
export interface NotificationData {
  category?: string;
  amount?: number;
  reference?: string;
  status?: string;
  withdrawalId?: string;
  [key: string]: any;
}

export interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  user_id: string;
  created_at: string;
  seen: boolean;
  data?: NotificationData;
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

export type NotificationType = 'deposit' | 'withdrawal' | 'investment' | 'security' | 'marketing' | 'info' | 'success' | 'error' | 'warning';
export type NotificationCategory = 'system' | 'transaction' | 'investment' | 'security' | 'marketing' | 'info' | 'success' | 'error' | 'warning';

export const NotificationCategories = {
  SYSTEM: 'system' as NotificationCategory,
  TRANSACTION: 'transaction' as NotificationCategory,
  INVESTMENT: 'investment' as NotificationCategory,
  SECURITY: 'security' as NotificationCategory,
  MARKETING: 'marketing' as NotificationCategory,
  INFO: 'info' as NotificationCategory,
  SUCCESS: 'success' as NotificationCategory,
  ERROR: 'error' as NotificationCategory,
  WARNING: 'warning' as NotificationCategory,
};

export interface NotificationCreateParams {
  title: string;
  description: string;
  type: string;
  category?: string;
  metadata?: Record<string, any>;
}

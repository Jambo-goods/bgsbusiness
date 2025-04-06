
export interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  seen: boolean;
  created_at: string;
  user_id: string;
  data?: {
    category?: string;
    [key: string]: any;
  };
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: string;
  category: string;
  metadata: Record<string, any>;
}

export type NotificationCategory = 'info' | 'success' | 'warning' | 'error';

export const NotificationCategories = {
  INFO: 'info' as NotificationCategory,
  SUCCESS: 'success' as NotificationCategory,
  WARNING: 'warning' as NotificationCategory,
  ERROR: 'error' as NotificationCategory
};

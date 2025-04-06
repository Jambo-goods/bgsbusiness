
// Notification types
export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: string;
  category: NotificationCategory;
  metadata?: Record<string, any>;
}

export interface NotificationData {
  category?: NotificationCategory;
  [key: string]: any;
}

// This will match what comes from the database
export interface DatabaseNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  created_at: string;
  seen: boolean;
  type: string;
  data?: Record<string, any> | null;
}

export interface NotificationCreateParams {
  title: string;
  description: string;
  type?: string;
  category?: NotificationCategory;
  metadata?: Record<string, any>;
  userId?: string;
}

export type NotificationCategory = typeof NotificationCategories[keyof typeof NotificationCategories];

export const NotificationCategories = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;

export interface NotificationService {
  getNotifications(): Promise<Notification[]>;
  getUnreadCount(): Promise<number>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(): Promise<boolean>;
  deleteNotification(notificationId: string): Promise<boolean>;
  deleteAllNotifications(): Promise<boolean>;
  createNotification(params: NotificationCreateParams): Promise<boolean>;
}

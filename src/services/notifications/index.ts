
import { NotificationServiceImpl } from './NotificationServiceImpl';
import { AdminNotificationServiceImpl } from './AdminNotificationService';
import { NotificationCategories } from './types';
import type { Notification, NotificationCategory, NotificationData, NotificationService } from './types';

// Create instances
export const notificationService = new NotificationServiceImpl();
export const adminNotificationService = new AdminNotificationServiceImpl();

// Export types and constants
export type { Notification, NotificationCategory, NotificationData, NotificationService };
export { NotificationCategories };

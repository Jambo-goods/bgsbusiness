
// DEPRECATED: This file is kept for backward compatibility.
// Please import from "@/services/notifications" instead.

import { 
  notificationService, 
} from "./notifications";

// Re-export everything to maintain backward compatibility
export { notificationService };
export type { 
  Notification, 
  NotificationType, 
  NotificationCategory, 
} from "./notifications";
export { NotificationCategories } from "./notifications";


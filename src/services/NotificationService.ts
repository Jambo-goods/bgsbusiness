
// DEPRECATED: This file is kept for backward compatibility.
// Please import from "@/services/notifications" instead.

import { 
  notificationService, 
  Notification,
  NotificationCategories
} from "./notifications";

// Re-export everything to maintain backward compatibility
export { notificationService };
export type { Notification };
export { NotificationCategories };

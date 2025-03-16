
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Notification, NotificationCategory, NotificationType, NotificationData } from "./types";

interface CreateNotificationParams {
  title: string;
  description: string;
  type: NotificationType;
  category: NotificationCategory;
  metadata?: Record<string, any>;
}

export class BaseNotificationService {
  /**
   * Base method for creating notifications
   */
  async createNotification({
    title,
    description,
    type,
    category,
    metadata = {}
  }: CreateNotificationParams): Promise<void> {
    try {
      // Get the current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.warn("No active session found, skipping notification");
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Create notification data object with proper structure for database
      const notificationData: NotificationData = {
        category,
        ...metadata
      };
      
      // Insert notification into database
      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        title: title,
        message: description, // Database uses 'message' instead of 'description'
        type: type,
        data: notificationData,
        seen: false
      });
      
      if (error) {
        console.error("Error creating notification:", error);
      }
      
      // Show toast notification
      this.showToast(title, description, category);
    } catch (error) {
      console.error("Error in notification service:", error);
    }
  }
  
  /**
   * Display a toast notification
   */
  private showToast(title: string, description: string, category: NotificationCategory): void {
    switch (category) {
      case 'success':
        toast.success(description, { id: title });
        break;
      case 'error':
        toast.error(description, { id: title });
        break;
      case 'warning':
        toast.warning(description, { id: title });
        break;
      case 'info':
      default:
        toast.info(description, { id: title });
        break;
    }
  }
  
  /**
   * Get all notifications for the current user
   */
  async fetchNotifications(): Promise<Notification[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return [];
      }
      
      const userId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }
      
      // Convert database format to application format
      return (data || []).map(item => {
        const notificationData = item.data as NotificationData || {};
        return {
          id: item.id,
          title: item.title,
          description: item.message,
          date: new Date(item.created_at),
          read: item.seen,
          type: item.type as NotificationType,
          category: notificationData.category || 'info',
          metadata: notificationData || {}
        };
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }
}

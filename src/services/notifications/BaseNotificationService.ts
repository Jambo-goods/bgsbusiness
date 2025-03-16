
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
  async fetchNotifications(limit: number = 20): Promise<Notification[]> {
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
        .order('created_at', { ascending: false })
        .limit(limit);
      
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

  /**
   * Get all notifications for the current user (alias for fetchNotifications)
   */
  getNotifications(limit: number = 20): Promise<Notification[]> {
    return this.fetchNotifications(limit);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return 0;
      }
      
      const userId = sessionData.session.user.id;
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('seen', false);
      
      if (error) {
        console.error("Error getting unread count:", error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id);
      
      if (error) {
        console.error("Error marking notification as read:", error);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<void> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error marking all notifications as read:", error);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }

  /**
   * Set up realtime subscription for new notifications
   */
  setupRealtimeSubscription(callback: () => void): () => void {
    const { data: { session } } = supabase.auth.getSession();
    
    if (!session) {
      console.warn("No active session for realtime subscription");
      return () => {};
    }
    
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${session.user.id}`
      }, () => {
        if (callback) callback();
      })
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

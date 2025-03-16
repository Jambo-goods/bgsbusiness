
import { supabase } from "@/integrations/supabase/client";
import { Notification, NotificationCategory, NotificationType, DatabaseNotification } from "./types";
import { v4 as uuidv4 } from 'uuid';

interface NotificationPayload {
  title: string;
  description: string;
  type: NotificationType;
  category: NotificationCategory;
  metadata?: Record<string, any>;
}

export class BaseNotificationService {
  /**
   * Create a notification for the current user
   */
  async createNotification(payload: NotificationPayload): Promise<void> {
    try {
      console.log("Creating notification with payload:", payload);
      
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.error("User not authenticated");
        return;
      }
      
      const userId = sessionData.session.user.id;
      console.log("Creating notification for user:", userId);
      
      // Create notification in database
      const { error } = await supabase.from('notifications').insert({
        id: uuidv4(),
        user_id: userId,
        title: payload.title,
        message: payload.description,
        type: payload.type,
        seen: false,
        data: { 
          ...payload.metadata,
          category: payload.category 
        }
      });
      
      if (error) {
        console.error("Error creating notification:", error);
        throw error;
      }
      
      console.log("Notification created successfully");
    } catch (error) {
      console.error("Error in createNotification:", error);
      throw error;
    }
  }
  
  private realtimeChannel = supabase.channel('notifications');

  /**
   * Get all notifications for the current user
   * @param limit The number of notifications to get
   */
  async getNotifications(limit: number = 50): Promise<Notification[]> {
    try {
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        console.error("User not authenticated");
        return [];
      }
      
      const userId = session.session.user.id;
      
      // Get notifications from database
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
      
      // Transform database notifications to app notifications
      return (data as DatabaseNotification[]).map(item => ({
        id: item.id,
        title: item.title,
        description: item.message,
        date: new Date(item.created_at),
        read: item.seen,
        type: item.type as NotificationType,
        category: item.data?.category as NotificationCategory,
        metadata: item.data
      }));
    } catch (error) {
      console.error("Error in getNotifications:", error);
      return [];
    }
  }

  /**
   * Get the count of unread notifications for the current user
   */
  async getUnreadCount(): Promise<number> {
    try {
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        console.error("User not authenticated");
        return 0;
      }
      
      const userId = session.session.user.id;
      
      // Get unread notifications count
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('seen', false);
      
      if (error) {
        console.error("Error fetching unread count:", error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error("Error in getUnreadCount:", error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   * @param id The id of the notification to mark as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        console.error("User not authenticated");
        return;
      }
      
      const userId = session.session.user.id;
      
      // Update notification in database
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error marking notification as read:", error);
      }
    } catch (error) {
      console.error("Error in markAsRead:", error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        console.error("User not authenticated");
        return;
      }
      
      const userId = session.session.user.id;
      
      // Update notifications in database
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error marking all notifications as read:", error);
      }
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
    }
  }
  
  /**
   * Setup real-time subscription for notifications
   * @param callback Function to call when a new notification is received
   * @returns Function to unsubscribe from the real-time subscription
   */
  setupRealtimeSubscription(callback: () => void): () => void {
    this.realtimeChannel
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        console.log('Realtime notification received:', payload);
        callback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(this.realtimeChannel);
    };
  }
}


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Notification, NotificationCreateParams, NotificationCategory } from "./types";

export class BaseNotificationService {
  async createNotification(notification: NotificationCreateParams): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error("Cannot create notification: User not authenticated");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: notification.title,
          description: notification.description,
          type: notification.type,
          category: notification.category || 'info',
          metadata: notification.metadata || {},
          read: false
        });
      
      if (error) throw error;
      
      // Also show a toast notification
      this.showToast(notification);
      
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }
  
  showToast(notification: Pick<Notification, 'title' | 'description' | 'category'>): void {
    const { title, description, category } = notification;
    
    switch(category) {
      case 'success':
        toast.success(title, { description });
        break;
      case 'warning':
        toast.warning(title, { description });
        break;
      case 'error':
        toast.error(title, { description });
        break;
      case 'info':
      default:
        toast.info(title, { description });
        break;
    }
  }
  
  async getNotifications(limit: number = 10): Promise<Notification[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error("Cannot get notifications: User not authenticated");
        return [];
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        description: notification.description,
        date: new Date(notification.created_at),
        read: notification.read,
        type: notification.type as Notification['type'],
        category: notification.category as NotificationCategory,
        metadata: notification.metadata
      }));
      
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }
  
  async getUnreadCount(): Promise<number> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      return count || 0;
      
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return 0;
    }
  }
  
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }
  
  async markAllAsRead(): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.session.user.id)
        .eq('read', false);
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }
}

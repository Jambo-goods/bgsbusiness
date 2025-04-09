
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Notification, NotificationCreateParams, DatabaseNotification } from "./types";

export class BaseNotificationService {
  async createNotification(props: NotificationCreateParams): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return false;

      const id = uuidv4();
      const { title, description, type, category = 'info', metadata = {}, userId = userData.user.id } = props;

      const { error } = await supabase.from('notifications').insert({
        id,
        title,
        message: description,
        type,
        user_id: userId,
        created_at: new Date().toISOString(),
        seen: false,
        data: { category, ...metadata }
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No authenticated session');
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map((item) => this.mapDatabaseNotification(item as DatabaseNotification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;

      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', session.session.user.id)
        .eq('seen', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      console.log('Deleting notification with ID:', notificationId);
      
      // First verify the session exists
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.error('No authenticated session when deleting notification');
        return false;
      }
      
      // Delete the notification with additional logging
      console.log('About to execute deletion query for notification:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Supabase error deleting notification:', error);
        throw error;
      }
      
      console.log('Notification deleted successfully from database');
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async deleteAllNotifications(): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log('No session found when trying to delete all notifications');
        return false;
      }

      console.log('Attempting to delete all notifications for user:', session.session.user.id);
      
      // Delete notifications with additional logging
      console.log('About to execute deletion query for all notifications');
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', session.session.user.id);

      if (error) {
        console.error('Supabase error deleting all notifications:', error);
        throw error;
      }
      
      console.log('All notifications deleted successfully from database');
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }

  protected mapDatabaseNotification(dbNotification: DatabaseNotification): Notification {
    return {
      id: dbNotification.id,
      title: dbNotification.title,
      description: dbNotification.message,
      date: new Date(dbNotification.created_at),
      read: dbNotification.seen,
      type: dbNotification.type,
      category: dbNotification.data?.category || 'info',
      metadata: dbNotification.data || {}
    };
  }
}


import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Notification, NotificationCreateParams, DatabaseNotification } from "./types";

export class BaseNotificationService {
  async createNotification(props: NotificationCreateParams): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const id = uuidv4();
    const { title, description, type, category = 'info', metadata = {} } = props;

    await supabase.from('notifications').insert({
      id,
      title,
      message: description,
      type,
      user_id: userData.user.id,
      created_at: new Date().toISOString(),
      seen: false,
      data: { category, ...metadata }
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ seen: true })
      .eq('id', notificationId);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
  }

  async deleteAllNotifications(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userData.user.id);
  }

  async getNotifications(): Promise<Notification[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(item => this.mapDatabaseToNotification(item as DatabaseNotification));
  }

  async getUnreadCount(): Promise<number> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.user.id)
      .eq('seen', false);

    return count || 0;
  }

  async markAllAsRead(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    await supabase
      .from('notifications')
      .update({ seen: true })
      .eq('user_id', userData.user.id)
      .eq('seen', false);
  }

  async setupRealtimeSubscription(callback: () => void): Promise<() => void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return () => {};

    const channel = supabase
      .channel('notifications_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userData.user.id}`
      }, () => {
        callback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  protected mapDatabaseToNotification(dbNotification: DatabaseNotification): Notification {
    const data = dbNotification.data || {};
    return {
      id: dbNotification.id,
      title: dbNotification.title,
      description: dbNotification.message,
      date: new Date(dbNotification.created_at),
      read: dbNotification.seen,
      type: dbNotification.type,
      category: typeof data === 'object' ? data.category : 'info',
      metadata: typeof data === 'object' ? data : {}
    };
  }
}

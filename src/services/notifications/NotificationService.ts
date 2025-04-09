
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Notification, NotificationCreateParams, NotificationCategory, NotificationData, DatabaseNotification } from "./types";
import { NotificationCategories } from "./types";

export class NotificationServiceImpl {
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

      return (data || []).map((dbNotification: any) => ({
        id: dbNotification.id,
        title: dbNotification.title,
        description: dbNotification.message,
        date: new Date(dbNotification.created_at),
        read: dbNotification.seen,
        type: dbNotification.type,
        category: dbNotification.data?.category || NotificationCategories.info,
        metadata: dbNotification.data || {}
      }));
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
      const { error, data } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Supabase error deleting notification:', error);
        throw error;
      }
      
      console.log('Notification deletion response:', data);
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
      const { error, data } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', session.session.user.id);

      if (error) {
        console.error('Supabase error deleting all notifications:', error);
        throw error;
      }
      
      console.log('All notifications deletion response:', data);
      console.log('All notifications deleted successfully from database');
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }

  async createNotification(params: NotificationCreateParams): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;

      const userId = params.userId || session.session.user.id;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: params.title,
          message: params.description,
          type: params.type,
          data: {
            category: params.category || NotificationCategories.info,
            ...params.metadata
          },
          seen: false
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  // Withdrawal notification methods
  async withdrawalScheduled(amount: number): Promise<void> {
    try {
      await this.createNotification({
        title: 'Demande de retrait programmée',
        description: `Votre demande de retrait de ${amount}€ a été programmée.`,
        type: 'withdrawal',
        category: NotificationCategories.info,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal scheduled notification:', error);
    }
  }

  async withdrawalValidated(amount: number): Promise<void> {
    try {
      await this.createNotification({
        title: 'Demande de retrait validée',
        description: `Votre demande de retrait de ${amount}€ a été validée.`,
        type: 'withdrawal',
        category: NotificationCategories.success,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal validated notification:', error);
    }
  }

  async withdrawalCompleted(amount: number): Promise<void> {
    try {
      await this.createNotification({
        title: 'Retrait complété',
        description: `Votre retrait de ${amount}€ a été effectué avec succès.`,
        type: 'withdrawal',
        category: NotificationCategories.success,
        metadata: { amount }
      });
      toast.success(`Retrait de ${amount}€ complété`);
    } catch (error) {
      console.error('Error creating withdrawal completed notification:', error);
    }
  }

  async withdrawalRejected(amount: number): Promise<void> {
    try {
      await this.createNotification({
        title: 'Demande de retrait rejetée',
        description: `Votre demande de retrait de ${amount}€ a été rejetée. Veuillez contacter le support pour plus d'informations.`,
        type: 'withdrawal',
        category: NotificationCategories.error,
        metadata: { amount }
      });
      toast.error(`Retrait de ${amount}€ rejeté`);
    } catch (error) {
      console.error('Error creating withdrawal rejected notification:', error);
    }
  }

  async withdrawalReceived(amount: number): Promise<void> {
    try {
      await this.createNotification({
        title: 'Demande de retrait reçue',
        description: `Votre demande de retrait de ${amount}€ a été reçue et est en cours de traitement.`,
        type: 'withdrawal',
        category: NotificationCategories.info,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal received notification:', error);
    }
  }

  async withdrawalConfirmed(amount: number): Promise<void> {
    try {
      await this.createNotification({
        title: 'Demande de retrait confirmée',
        description: `Votre demande de retrait de ${amount}€ a été confirmée et sera traitée sous peu.`,
        type: 'withdrawal',
        category: NotificationCategories.success,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal confirmed notification:', error);
    }
  }

  async withdrawalPaid(amount: number): Promise<void> {
    try {
      await this.createNotification({
        title: 'Retrait payé',
        description: `Votre retrait de ${amount}€ a été payé et devrait apparaître sur votre compte bancaire sous peu.`,
        type: 'withdrawal',
        category: NotificationCategories.success,
        metadata: { amount }
      });
      toast.success(`Retrait de ${amount}€ payé`);
    } catch (error) {
      console.error('Error creating withdrawal paid notification:', error);
    }
  }

  // Investment notification methods
  async investmentConfirmed(projectName: string, amount: number): Promise<void> {
    try {
      await this.createNotification({
        title: 'Investissement confirmé',
        description: `Votre investissement de ${amount}€ dans le projet "${projectName}" a été confirmé.`,
        type: 'investment',
        category: NotificationCategories.success,
        metadata: { projectName, amount }
      });
      toast.success(`Investissement de ${amount}€ confirmé`);
    } catch (error) {
      console.error('Error creating investment confirmed notification:', error);
    }
  }
}


import { supabase } from "@/integrations/supabase/client";
import { BaseNotificationService } from "./BaseNotificationService";
import { Notification, NotificationCategory, NotificationCategories } from "./types";

export class NotificationService extends BaseNotificationService {
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.message,
        date: new Date(item.created_at),
        read: item.seen,
        type: item.type || 'general',
        category: (item.data?.category || 'info') as NotificationCategory,
        metadata: item.data || {}
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }
  
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', notificationId);
        
      return !error;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }
  
  async markAllAsRead(): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return false;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('user_id', session.session.user.id)
        .eq('seen', false);
        
      return !error;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }
  
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
        
      return !error;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  }
  
  async deleteAllNotifications(): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return false;
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', session.session.user.id);
        
      return !error;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      return false;
    }
  }
  
  async createReferralWelcomeNotification(userId: string): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Bienvenue au programme de parrainage",
        description: "Partagez votre code de parrainage pour gagner des récompenses!",
        type: "referral",
        category: NotificationCategories.INFO
      });
      return true;
    } catch (error) {
      console.error("Error creating referral welcome notification:", error);
      return false;
    }
  }

  async createReferralRewardNotification(amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Prime de parrainage reçue!",
        description: `Félicitations! Vous avez reçu ${amount}€ de prime de parrainage.`,
        type: "referral",
        category: NotificationCategories.SUCCESS
      });
      return true;
    } catch (error) {
      console.error("Error creating referral reward notification:", error);
      return false;
    }
  }
  
  // Add withdrawal notification methods
  async withdrawalScheduled(amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Retrait programmé",
        description: `Votre demande de retrait de ${amount}€ a été enregistrée.`,
        type: "withdrawal",
        category: NotificationCategories.INFO
      });
      return true;
    } catch (error) {
      console.error("Error creating withdrawal scheduled notification:", error);
      return false;
    }
  }
  
  async withdrawalValidated(amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Retrait validé",
        description: `Votre demande de retrait de ${amount}€ a été validée.`,
        type: "withdrawal",
        category: NotificationCategories.INFO
      });
      return true;
    } catch (error) {
      console.error("Error creating withdrawal validated notification:", error);
      return false;
    }
  }
  
  async withdrawalCompleted(amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Retrait effectué",
        description: `Votre retrait de ${amount}€ a été effectué.`,
        type: "withdrawal",
        category: NotificationCategories.SUCCESS
      });
      return true;
    } catch (error) {
      console.error("Error creating withdrawal completed notification:", error);
      return false;
    }
  }
  
  async withdrawalRejected(amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Retrait rejeté",
        description: `Votre demande de retrait de ${amount}€ a été rejetée. Contactez le support pour plus d'informations.`,
        type: "withdrawal",
        category: NotificationCategories.ERROR
      });
      return true;
    } catch (error) {
      console.error("Error creating withdrawal rejected notification:", error);
      return false;
    }
  }
  
  async withdrawalReceived(amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Retrait reçu",
        description: `Confirmez-vous avoir reçu votre retrait de ${amount}€?`,
        type: "withdrawal",
        category: NotificationCategories.INFO
      });
      return true;
    } catch (error) {
      console.error("Error creating withdrawal received notification:", error);
      return false;
    }
  }
  
  async withdrawalConfirmed(amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Retrait confirmé",
        description: `Merci d'avoir confirmé la réception de votre retrait de ${amount}€.`,
        type: "withdrawal",
        category: NotificationCategories.SUCCESS
      });
      return true;
    } catch (error) {
      console.error("Error creating withdrawal confirmed notification:", error);
      return false;
    }
  }
  
  async withdrawalPaid(amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Retrait payé",
        description: `Votre retrait de ${amount}€ a été envoyé sur votre compte bancaire.`,
        type: "withdrawal",
        category: NotificationCategories.SUCCESS
      });
      return true;
    } catch (error) {
      console.error("Error creating withdrawal paid notification:", error);
      return false;
    }
  }
  
  async investmentConfirmed(projectName: string, amount: number): Promise<boolean> {
    try {
      await this.createNotification({
        title: "Investissement confirmé",
        description: `Votre investissement de ${amount}€ dans "${projectName}" a été confirmé.`,
        type: "investment",
        category: NotificationCategories.SUCCESS
      });
      return true;
    } catch (error) {
      console.error("Error creating investment confirmed notification:", error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();

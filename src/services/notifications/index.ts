
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  DatabaseNotification, 
  Notification, 
  NotificationCategory,
  NotificationCategories
} from "./types";

// Helper function to convert from database to frontend model
const convertDbNotificationToFrontend = (dbNotification: DatabaseNotification): Notification => {
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
};

export const notificationService = {
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

      return (data as DatabaseNotification[]).map(convertDbNotificationToFrontend);
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  },
  
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ seen: true })
        .eq('id', notificationId);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  },
  
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
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  },
  
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  },
  
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
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      return false;
    }
  },
  
  async createReferralWelcomeNotification(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '🎁 Bonus de bienvenue',
          message: 'Vous avez reçu un bonus de 25 € grâce à votre inscription avec un code de parrainage.',
          type: 'referral',
          data: {
            category: 'success',
            amount: 25
          }
        });
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error creating referral welcome notification:", error);
      return false;
    }
  },
  
  async createReferralRewardNotification(userId: string, referredName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: '🎉 Parrainage réussi !',
          message: `Votre filleul ${referredName} vient d'investir. Vous avez gagné une récompense de 25 €.`,
          type: 'referral',
          data: {
            category: 'success',
            amount: 25,
            referredName
          }
        });
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error creating referral reward notification:", error);
      return false;
    }
  },

  // Add withdrawal notification methods
  async withdrawalScheduled(amount: number): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: 'Retrait planifié',
          message: `Votre demande de retrait de ${amount}€ a été planifiée.`,
          type: 'withdrawal',
          data: { category: 'info', amount }
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating withdrawal scheduled notification:", error);
      return false;
    }
  },

  async withdrawalValidated(amount: number): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: 'Retrait validé',
          message: `Votre demande de retrait de ${amount}€ a été validée.`,
          type: 'withdrawal',
          data: { category: 'success', amount }
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating withdrawal validated notification:", error);
      return false;
    }
  },

  async withdrawalCompleted(amount: number): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: 'Retrait effectué',
          message: `Votre retrait de ${amount}€ a été effectué.`,
          type: 'withdrawal',
          data: { category: 'success', amount }
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating withdrawal completed notification:", error);
      return false;
    }
  },

  async withdrawalRejected(amount: number): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: 'Retrait rejeté',
          message: `Votre demande de retrait de ${amount}€ a été rejetée.`,
          type: 'withdrawal',
          data: { category: 'error', amount }
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating withdrawal rejected notification:", error);
      return false;
    }
  },

  async withdrawalReceived(amount: number): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: 'Retrait reçu',
          message: `Votre retrait de ${amount}€ a été reçu.`,
          type: 'withdrawal',
          data: { category: 'success', amount }
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating withdrawal received notification:", error);
      return false;
    }
  },

  async withdrawalConfirmed(amount: number): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: 'Retrait confirmé',
          message: `Votre retrait de ${amount}€ a été confirmé.`,
          type: 'withdrawal',
          data: { category: 'success', amount }
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating withdrawal confirmed notification:", error);
      return false;
    }
  },

  async withdrawalPaid(amount: number): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: 'Retrait payé',
          message: `Votre retrait de ${amount}€ a été payé.`,
          type: 'withdrawal',
          data: { category: 'success', amount }
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating withdrawal paid notification:", error);
      return false;
    }
  },

  async investmentConfirmed(projectName: string, amount: number): Promise<boolean> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return false;
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: 'Investissement confirmé',
          message: `Votre investissement de ${amount}€ dans ${projectName} a été confirmé.`,
          type: 'investment',
          data: { category: 'success', amount, projectName }
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating investment confirmed notification:", error);
      return false;
    }
  }
};

// Export the needed types
export type { Notification, NotificationCategory };
export { NotificationCategories };

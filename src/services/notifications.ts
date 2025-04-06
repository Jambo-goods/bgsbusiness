
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  seen: boolean;
  created_at: string;
  data?: {
    category?: string;
    [key: string]: any;
  };
}

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
      
      return data as Notification[];
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
  }
};

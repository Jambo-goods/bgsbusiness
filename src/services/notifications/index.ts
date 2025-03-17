
import { supabase } from "@/integrations/supabase/client";
import { DepositNotificationService } from "./DepositNotificationService";
import { WithdrawalNotificationService } from "./WithdrawalNotificationService";
import { InvestmentNotificationService } from "./InvestmentNotificationService";
import { SecurityNotificationService } from "./SecurityNotificationService";
import { MarketingNotificationService } from "./MarketingNotificationService";
import { DatabaseNotification, NotificationCategory, NotificationData, NotificationType } from "./types";

class NotificationService {
  private _deposit: DepositNotificationService;
  private _withdrawal: WithdrawalNotificationService;
  private _investment: InvestmentNotificationService;
  private _security: SecurityNotificationService;
  private _marketing: MarketingNotificationService;

  constructor() {
    this._deposit = new DepositNotificationService();
    this._withdrawal = new WithdrawalNotificationService();
    this._investment = new InvestmentNotificationService();
    this._security = new SecurityNotificationService();
    this._marketing = new MarketingNotificationService();
  }

  get deposit(): DepositNotificationService {
    return this._deposit;
  }

  get withdrawal(): WithdrawalNotificationService {
    return this._withdrawal;
  }

  get investment(): InvestmentNotificationService {
    return this._investment;
  }

  get security(): SecurityNotificationService {
    return this._security;
  }

  get marketing(): MarketingNotificationService {
    return this._marketing;
  }

  async markAllAsRead(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("notifications")
        .update({ seen: true })
        .eq("user_id", user.user.id)
        .is("seen", false);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ seen: true })
        .eq("id", notificationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  async deleteAllNotifications(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return 0;
      }

      const { data, error, count } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", user.user.id)
        .eq("seen", false);

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error("Error getting unread notifications count:", error);
      return 0;
    }
  }

  async getAllNotifications(): Promise<Notification[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapDatabaseNotificationToModel);
    } catch (error) {
      console.error("Error getting all notifications:", error);
      return [];
    }
  }

  private mapDatabaseNotificationToModel(dbNote: DatabaseNotification): Notification {
    return {
      id: dbNote.id,
      title: dbNote.title,
      description: dbNote.message,
      date: new Date(dbNote.created_at),
      read: dbNote.seen,
      type: dbNote.type as NotificationType,
      category: dbNote.data?.category as NotificationCategory || 'info',
      metadata: dbNote.data || {}
    };
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Type definitions
export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: NotificationType;
  category?: NotificationCategory;
  metadata?: Record<string, any>;
}

// Re-export types correctly
export type { NotificationType } from './types';
export type { NotificationCategory } from './types';
export { NotificationCategories } from './types';

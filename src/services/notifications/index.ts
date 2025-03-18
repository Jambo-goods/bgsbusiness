// Generic notification service with improved compatibility

import { toast } from "sonner";

// Basic notification types to satisfy imports
export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  created_at: string;
};

export type NotificationType = 'info' | 'success' | 'error' | 'warning';
export type NotificationCategory = 'system' | 'transaction' | 'investment' | 'security' | 'marketing';

export const NotificationCategories = {
  SYSTEM: 'system' as NotificationCategory,
  TRANSACTION: 'transaction' as NotificationCategory,
  INVESTMENT: 'investment' as NotificationCategory,
  SECURITY: 'security' as NotificationCategory,
  MARKETING: 'marketing' as NotificationCategory,
};

class GenericNotificationService {
  private showNotification(title: string, message: string, type: "info" | "success" | "error" | "warning" = "info") {
    switch (type) {
      case "success":
        toast.success(title, { description: message });
        break;
      case "error":
        toast.error(title, { description: message });
        break;
      case "warning":
        toast.warning(title, { description: message });
        break;
      default:
        toast.info(title, { description: message });
    }
  }

  // Get all notifications for a user
  public getNotifications(userId: string) {
    console.log("Getting notifications for user", userId);
    return Promise.resolve([]);
  }

  // Get unread count for notifications
  public getUnreadCount(userId: string) {
    return Promise.resolve(0);
  }

  // Mark a notification as read
  public markAsRead(notificationId: string) {
    console.log("Marking notification as read", notificationId);
    return Promise.resolve(true);
  }

  // Mark all notifications as read
  public markAllAsRead(userId: string) {
    console.log("Marking all notifications as read for user", userId);
    return Promise.resolve(true);
  }

  // Set up realtime subscription
  public setupRealtimeSubscription(userId: string, callback: () => void) {
    console.log("Setting up realtime subscription for user", userId);
    return () => {}; // Cleanup function
  }

  // Notification methods
  public depositRequested(params: any = {}) {
    this.notify("depositRequested", params);
  }

  public depositSuccess(params: any = {}) {
    this.notify("depositSuccess", params);
  }

  public withdrawalRequested(params: any = {}) {
    this.notify("withdrawalRequested", params);
  }

  public withdrawalScheduled(params: any = {}) {
    this.notify("withdrawalScheduled", params);
  }

  public withdrawalValidated(params: any = {}) {
    this.notify("withdrawalValidated", params);
  }

  public withdrawalCompleted(params: any = {}) {
    this.notify("withdrawalCompleted", params);
  }

  public withdrawalRejected(params: any = {}) {
    this.notify("withdrawalRejected", params);
  }

  public withdrawalReceived(params: any = {}) {
    this.notify("withdrawalReceived", params);
  }

  public withdrawalConfirmed(params: any = {}) {
    this.notify("withdrawalConfirmed", params);
  }

  public withdrawalPaid(params: any = {}) {
    this.notify("withdrawalPaid", params);
  }

  public insufficientFunds(params: any = {}) {
    this.notify("insufficientFunds", params);
  }

  public investmentConfirmed(params: any = {}) {
    this.notify("investmentConfirmed", params);
  }

  public newInvestmentOpportunity(params: any = {}) {
    this.notify("newInvestmentOpportunity", params);
  }

  // Generic notify method
  public notify(type: string, params: any = {}) {
    // Map des notifications avec titres et messages par défaut
    const notifications: Record<string, { title: string; message: string; type: "info" | "success" | "error" | "warning" }> = {
      // Dépôts
      depositRequested: {
        title: "Dépôt demandé",
        message: `Votre demande de dépôt a été enregistrée avec succès.`,
        type: "success"
      },
      depositSuccess: {
        title: "Dépôt validé",
        message: `Votre dépôt a été validé et ajouté à votre portefeuille.`,
        type: "success"
      },
      // Retraits
      withdrawalRequested: {
        title: "Demande de retrait enregistrée",
        message: `Votre demande de retrait a été enregistrée et sera traitée prochainement.`,
        type: "success"
      },
      withdrawalScheduled: {
        title: "Retrait planifié",
        message: `Votre retrait a été planifié et sera traité prochainement.`,
        type: "info"
      },
      withdrawalValidated: {
        title: "Retrait validé",
        message: `Votre demande de retrait a été validée et sera traitée prochainement.`,
        type: "success"
      },
      withdrawalCompleted: {
        title: "Retrait effectué",
        message: `Votre retrait a été effectué avec succès.`,
        type: "success"
      },
      withdrawalRejected: {
        title: "Retrait refusé",
        message: `Votre demande de retrait a été refusée.`,
        type: "error"
      },
      withdrawalReceived: {
        title: "Retrait reçu",
        message: `Votre retrait a été reçu.`,
        type: "success"
      },
      withdrawalConfirmed: {
        title: "Retrait confirmé",
        message: `Votre retrait a été confirmé.`,
        type: "success"
      },
      withdrawalPaid: {
        title: "Retrait payé",
        message: `Votre retrait a été payé.`,
        type: "success"
      },
      // Investissements
      insufficientFunds: {
        title: "Fonds insuffisants",
        message: `Vous n'avez pas suffisamment de fonds dans votre portefeuille pour effectuer cette opération.`,
        type: "error"
      },
      investmentConfirmed: {
        title: "Investissement confirmé",
        message: `Votre investissement a été confirmé.`,
        type: "success"
      },
      newInvestmentOpportunity: {
        title: "Nouvelle opportunité d'investissement",
        message: `Une nouvelle opportunité d'investissement est disponible.`,
        type: "info"
      }
    };

    // Utiliser les notifications prédéfinies ou une notification générique
    const notification = notifications[type] || {
      title: "Notification",
      message: "Une mise à jour a été effectuée.",
      type: "info" as const
    };

    // Remplacer les placeholders dans le message si des paramètres sont fournis
    let finalMessage = notification.message;
    if (params) {
      Object.keys(params).forEach(key => {
        finalMessage = finalMessage.replace(`{${key}}`, params[key]);
      });
    }

    this.showNotification(notification.title, finalMessage, notification.type);
  }

  // Other methods for backward compatibility
  public deposit(params: any = {}) {
    this.notify("depositSuccess", params);
  }

  public withdrawal(params: any = {}) {
    this.notify("withdrawalCompleted", params);
  }
}

// Export a singleton instance
export const notificationService = new GenericNotificationService();

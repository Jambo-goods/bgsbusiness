
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  seen: boolean;
  created_at: string;
  data?: any;
}

export type NotificationType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'investment' 
  | 'system' 
  | 'marketing' 
  | 'profit_received'
  | 'project_completed'
  | 'security';

export type NotificationCategory = 'info' | 'success' | 'error' | 'warning';

export const NotificationCategories: Record<NotificationCategory, { icon: string; color: string }> = {
  info: { icon: 'info', color: 'blue' },
  success: { icon: 'check_circle', color: 'green' },
  error: { icon: 'error', color: 'red' },
  warning: { icon: 'warning', color: 'amber' }
};

class GenericNotificationService {
  private showNotification(title: string, message: string, type: NotificationCategory = "info") {
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

  // Method for component compatibility
  public notify(type: string, params: any = {}) {
    // Map des notifications avec titres et messages par défaut
    const notifications: Record<string, { title: string; message: string; type: NotificationCategory }> = {
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

  // API compatibility methods for existing components
  public getNotifications(userId: string, limit = 10) {
    console.log("Getting notifications for user", userId, "with limit", limit);
    return Promise.resolve([]);
  }
  
  public getAllNotifications(userId: string) {
    console.log("Getting all notifications for user", userId);
    return Promise.resolve([]);
  }
  
  public getUnreadCount(userId: string) {
    console.log("Getting unread count for user", userId);
    return Promise.resolve(0);
  }
  
  public markAsRead(notificationId: string) {
    console.log("Marking notification as read", notificationId);
    return Promise.resolve();
  }
  
  public markAllAsRead(userId: string) {
    console.log("Marking all notifications as read for user", userId);
    return Promise.resolve();
  }

  public setupRealtimeSubscription(userId: string, callback: () => void) {
    console.log("Setting up realtime subscription for user", userId);
    return () => {}; // Cleanup function
  }

  // Direct notification methods for backward compatibility
  depositRequested(amount: number, reference: string) {
    this.notify("depositRequested", { amount, reference });
    return Promise.resolve();
  }
  
  depositSuccess(amount: number) {
    this.notify("depositSuccess", { amount });
    return Promise.resolve();
  }
  
  withdrawalRequested(amount: number) {
    this.notify("withdrawalRequested", { amount });
    return Promise.resolve();
  }
  
  withdrawalScheduled() {
    this.notify("withdrawalScheduled");
    return Promise.resolve();
  }
  
  withdrawalValidated() {
    this.notify("withdrawalValidated");
    return Promise.resolve();
  }
  
  withdrawalCompleted(amount: number) {
    this.notify("withdrawalCompleted", { amount });
    return Promise.resolve();
  }
  
  withdrawalRejected() {
    this.notify("withdrawalRejected");
    return Promise.resolve();
  }
  
  withdrawalReceived() {
    this.notify("withdrawalReceived");
    return Promise.resolve();
  }
  
  withdrawalConfirmed() {
    this.notify("withdrawalConfirmed");
    return Promise.resolve();
  }
  
  withdrawalPaid() {
    this.notify("withdrawalPaid");
    return Promise.resolve();
  }
  
  insufficientFunds(amount: number) {
    this.notify("insufficientFunds", { amount });
    return Promise.resolve();
  }
  
  investmentConfirmed() {
    this.notify("investmentConfirmed");
    return Promise.resolve();
  }
  
  newInvestmentOpportunity() {
    this.notify("newInvestmentOpportunity");
    return Promise.resolve();
  }
  
  // Method for other services
  public deposit(params: any = {}) {
    this.notify("depositSuccess", params);
  }

  public withdrawal(params: any = {}) {
    this.notify("withdrawalCompleted", params);
  }
}

// Exporter une instance du service générique
export const notificationService = new GenericNotificationService();

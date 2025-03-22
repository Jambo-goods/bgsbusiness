
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { 
  Notification, 
  NotificationType, 
  NotificationCategory, 
  NotificationCreateParams, 
  DatabaseNotification 
} from "./types";

export type { 
  Notification, 
  NotificationType, 
  NotificationCategory,
  NotificationCreateParams
};

export { NotificationCategories } from "./types";

class NotificationService {
  private async createNotification(params: NotificationCreateParams): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const id = uuidv4();
    const { title, description, type, category = 'info', metadata = {} } = params;

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

  // Deposit notifications
  async depositRequested(amount: number, reference?: string): Promise<void> {
    return this.createNotification({
      title: "Virement bancaire confirmé",
      description: `Vous avez confirmé avoir effectué un virement bancaire de ${amount}€${reference ? ` avec la référence ${reference}` : ''}`,
      type: "deposit",
      category: "info",
      metadata: { 
        amount,
        reference,
        timestamp: new Date().toISOString()
      }
    });
  }

  async depositSuccess(amount: number): Promise<void> {
    return this.createNotification({
      title: "Dépôt validé",
      description: `Votre dépôt de ${amount}€ a été validé et ajouté à votre portefeuille.`,
      type: "deposit",
      category: "success",
      metadata: { amount }
    });
  }

  // Withdrawal notifications
  async withdrawalRequested(amount: number): Promise<void> {
    return this.createNotification({
      title: "Demande de retrait soumise",
      description: `Votre demande de retrait de ${amount}€ a été soumise et est en cours de traitement.`,
      type: "withdrawal",
      category: "info",
      metadata: { 
        amount,
        status: "submitted"
      }
    });
  }

  async withdrawalScheduled(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait planifié",
      description: `Votre retrait de ${amount}€ a été planifié et sera traité prochainement.`,
      type: "withdrawal",
      category: "info",
      metadata: { amount }
    });
  }

  async withdrawalValidated(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait validé",
      description: `Votre demande de retrait de ${amount}€ a été validée et sera traitée prochainement.`,
      type: "withdrawal",
      category: "success",
      metadata: { amount }
    });
  }

  async withdrawalCompleted(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait effectué",
      description: `Votre retrait de ${amount}€ a été effectué avec succès.`,
      type: "withdrawal",
      category: "success",
      metadata: { amount }
    });
  }

  async withdrawalRejected(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait refusé",
      description: `Votre demande de retrait de ${amount}€ a été refusée.`,
      type: "withdrawal",
      category: "error",
      metadata: { amount }
    });
  }

  async withdrawalReceived(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait reçu",
      description: `Votre demande de retrait de ${amount}€ a été reçue et est en cours d'examen.`,
      type: "withdrawal",
      category: "info",
      metadata: { amount }
    });
  }

  async withdrawalConfirmed(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait confirmé",
      description: `Votre demande de retrait de ${amount}€ a été confirmée et est en cours de traitement.`,
      type: "withdrawal",
      category: "success",
      metadata: { amount }
    });
  }

  async withdrawalPaid(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait payé",
      description: `Votre retrait de ${amount}€ a été payé. Le montant a été transféré sur votre compte bancaire.`,
      type: "withdrawal",
      category: "success",
      metadata: { 
        amount, 
        status: 'paid',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Investment notifications
  async investmentConfirmed(amount: number, projectName: string): Promise<void> {
    return this.createNotification({
      title: "Investissement confirmé",
      description: `Votre investissement de ${amount}€ dans le projet ${projectName} a été confirmé.`,
      type: "investment",
      category: "success",
      metadata: { amount, projectName }
    });
  }

  // Add the new investment opportunity notification
  async newInvestmentOpportunity(projectName: string, projectId?: string): Promise<void> {
    return this.createNotification({
      title: "Nouvelle opportunité d'investissement",
      description: `Un nouveau projet d'investissement est disponible : ${projectName}`,
      type: "investment",
      category: "info",
      metadata: { projectName, projectId }
    });
  }

  async insufficientFunds(amount: number): Promise<void> {
    return this.createNotification({
      title: "Fonds insuffisants",
      description: `Vous n'avez pas suffisamment de fonds (${amount}€ requis) pour effectuer cette opération.`,
      type: "info",
      category: "error",
      metadata: { amount }
    });
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

// Export a singleton instance
export const notificationService = new NotificationService();

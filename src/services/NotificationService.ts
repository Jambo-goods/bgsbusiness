
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 
  | 'deposit' | 'withdrawal' | 'investment' | 'security' | 'marketing';

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type: NotificationType;
  category?: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export const NotificationCategories = {
  deposit: { icon: 'wallet', title: 'Portefeuille' },
  withdrawal: { icon: 'wallet', title: 'Portefeuille' },
  investment: { icon: 'briefcase', title: 'Investissement' },
  security: { icon: 'shield', title: 'Sécurité' },
  marketing: { icon: 'megaphone', title: 'Actualités' },
};

class NotificationService {
  async createNotification(notification: Omit<Notification, 'id' | 'date' | 'read'>): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error("Cannot create notification: User not authenticated");
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: session.session.user.id,
          title: notification.title,
          description: notification.description,
          type: notification.type,
          category: notification.category || 'info',
          metadata: notification.metadata || {},
          read: false
        });
      
      if (error) throw error;
      
      // Also show a toast notification
      this.showToast(notification);
      
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }
  
  showToast(notification: Pick<Notification, 'title' | 'description' | 'category'>): void {
    const { title, description, category } = notification;
    
    switch(category) {
      case 'success':
        toast.success(title, { description });
        break;
      case 'warning':
        toast.warning(title, { description });
        break;
      case 'error':
        toast.error(title, { description });
        break;
      case 'info':
      default:
        toast.info(title, { description });
        break;
    }
  }
  
  async getNotifications(limit: number = 10): Promise<Notification[]> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.error("Cannot get notifications: User not authenticated");
        return [];
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data || []).map(notification => ({
        id: notification.id,
        title: notification.title,
        description: notification.description,
        date: new Date(notification.created_at),
        read: notification.read,
        type: notification.type as NotificationType,
        category: notification.category,
        metadata: notification.metadata
      }));
      
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }
  
  async getUnreadCount(): Promise<number> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        return 0;
      }
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.session.user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      return count || 0;
      
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return 0;
    }
  }
  
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }
  
  async markAllAsRead(): Promise<void> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        return;
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.session.user.id)
        .eq('read', false);
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }
  
  // Deposit Notifications
  depositSuccess(amount: number): Promise<void> {
    return this.createNotification({
      title: "Dépôt réussi",
      description: `Votre dépôt de ${amount}€ a été crédité sur votre compte.`,
      type: 'deposit',
      category: 'success',
      metadata: { amount }
    });
  }
  
  depositPending(amount: number): Promise<void> {
    return this.createNotification({
      title: "Dépôt en attente",
      description: `Votre dépôt de ${amount}€ est en attente de validation.`,
      type: 'deposit',
      category: 'info',
      metadata: { amount }
    });
  }
  
  // Withdrawal Notifications
  withdrawalValidated(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait validé",
      description: `Votre demande de retrait de ${amount}€ est en cours de traitement.`,
      type: 'withdrawal',
      category: 'info',
      metadata: { amount }
    });
  }
  
  withdrawalCompleted(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait effectué",
      description: `Votre retrait de ${amount}€ a été effectué avec succès.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount }
    });
  }
  
  insufficientFunds(): Promise<void> {
    return this.createNotification({
      title: "Solde insuffisant",
      description: "Solde insuffisant ! Ajoutez des fonds pour investir.",
      type: 'deposit',
      category: 'error'
    });
  }
  
  // Investment Notifications
  newInvestmentOpportunity(projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Nouvelle opportunité d'investissement",
      description: `Un nouveau projet ${projectName} est disponible ! Investissez dès maintenant.`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, projectId }
    });
  }
  
  investmentConfirmed(amount: number, projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Investissement confirmé",
      description: `Votre investissement de ${amount}€ dans ${projectName} a été confirmé.`,
      type: 'investment',
      category: 'success',
      metadata: { amount, projectName, projectId }
    });
  }
  
  profitReceived(amount: number, projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Rentabilité reçue",
      description: `Vous avez reçu ${amount}€ de bénéfices pour votre investissement dans ${projectName}.`,
      type: 'investment',
      category: 'success',
      metadata: { amount, projectName, projectId }
    });
  }
  
  projectFunded(projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Projet financé",
      description: `Le projet ${projectName} a atteint son financement et démarre bientôt !`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, projectId }
    });
  }
  
  projectCompleted(projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Projet terminé",
      description: `Votre investissement dans ${projectName} est terminé. Vérifiez vos bénéfices !`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, projectId }
    });
  }
  
  // Security Notifications
  loginSuccess(device: string): Promise<void> {
    return this.createNotification({
      title: "Connexion réussie",
      description: `Connexion réussie depuis ${device}.`,
      type: 'security',
      category: 'info',
      metadata: { device }
    });
  }
  
  suspiciousLogin(device: string): Promise<void> {
    return this.createNotification({
      title: "Tentative de connexion suspecte",
      description: `Alerte : Nouvelle connexion suspecte sur votre compte depuis ${device}. Si ce n'est pas vous, changez votre mot de passe.`,
      type: 'security',
      category: 'warning',
      metadata: { device }
    });
  }
  
  passwordChanged(): Promise<void> {
    return this.createNotification({
      title: "Mot de passe changé",
      description: "Votre mot de passe a été modifié avec succès.",
      type: 'security',
      category: 'success'
    });
  }
  
  // Marketing Notifications
  eventInvitation(eventName: string, date: string): Promise<void> {
    return this.createNotification({
      title: "Invitation à un événement",
      description: `Participez à notre webinaire sur ${eventName} ce ${date}.`,
      type: 'marketing',
      category: 'info',
      metadata: { eventName, date }
    });
  }
  
  specialOffer(percentage: number, endDate: string): Promise<void> {
    return this.createNotification({
      title: "Offre spéciale",
      description: `Profitez d'un bonus de ${percentage}% sur vos investissements jusqu'au ${endDate}.`,
      type: 'marketing',
      category: 'info',
      metadata: { percentage, endDate }
    });
  }
  
  referralBonus(friendName: string, bonus: number): Promise<void> {
    return this.createNotification({
      title: "Programme de parrainage",
      description: `Félicitations ! Votre filleul ${friendName} a rejoint la plateforme. Gagnez ${bonus}€.`,
      type: 'marketing',
      category: 'success',
      metadata: { friendName, bonus }
    });
  }
}

export const notificationService = new NotificationService();

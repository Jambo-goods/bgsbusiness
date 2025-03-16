
import { BaseNotificationService } from "./BaseNotificationService";

export class WithdrawalNotificationService extends BaseNotificationService {
  /**
   * Notification when a withdrawal request is submitted
   */
  withdrawalRequested(amount: number): Promise<void> {
    return this.createNotification({
      title: "Demande de retrait soumise",
      description: `Votre demande de retrait de ${amount}€ a été soumise et est en cours de traitement.`,
      type: 'withdrawal',
      category: 'info',
      metadata: { amount, status: 'submitted' }
    });
  }
  
  /**
   * Notification when a withdrawal request is validated
   */
  withdrawalValidated(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait validé",
      description: `Votre demande de retrait de ${amount}€ est en cours de traitement.`,
      type: 'withdrawal',
      category: 'info',
      metadata: { amount, status: 'validated' }
    });
  }
  
  /**
   * Notification when a withdrawal is scheduled
   */
  withdrawalScheduled(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait programmé",
      description: `Votre retrait de ${amount}€ a été programmé et sera traité prochainement.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount, status: 'scheduled' }
    });
  }
  
  /**
   * Notification when a withdrawal is completed
   */
  withdrawalCompleted(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait effectué",
      description: `Votre retrait de ${amount}€ a été effectué avec succès.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount, status: 'completed' }
    });
  }
  
  /**
   * Notification when a withdrawal is rejected
   */
  withdrawalRejected(amount: number, reason?: string): Promise<void> {
    const reasonText = reason ? ` Raison: ${reason}` : "";
    return this.createNotification({
      title: "Retrait refusé",
      description: `Votre demande de retrait de ${amount}€ a été refusée.${reasonText}`,
      type: 'withdrawal',
      category: 'error',
      metadata: { amount, status: 'rejected', reason }
    });
  }
  
  /**
   * Notification when a withdrawal request is processed
   */
  withdrawalProcessed(amount: number, status: string): Promise<void> {
    return this.createNotification({
      title: "Demande de retrait traitée",
      description: `Votre demande de retrait de ${amount}€ a été traitée. Statut: ${status}.`,
      type: 'withdrawal',
      category: status === 'rejected' ? 'error' : 'success',
      metadata: { amount, status, processed: true }
    });
  }

  /**
   * Notification for specific withdrawal statuses
   */
  withdrawalStatusUpdated(amount: number, status: string, reason?: string): Promise<void> {
    let title = "";
    let description = "";
    let category: 'info' | 'success' | 'warning' | 'error' = 'info';
    
    switch (status) {
      case 'submitted':
        title = "Demande de retrait soumise";
        description = `Votre demande de retrait de ${amount}€ a été soumise et est en cours de traitement.`;
        break;
      case 'validated':
      case 'approved':
        title = "Retrait validé";
        description = `Votre demande de retrait de ${amount}€ a été validée et sera traitée prochainement.`;
        category = 'success';
        break;
      case 'scheduled':
        title = "Retrait programmé";
        description = `Votre retrait de ${amount}€ a été programmé et sera envoyé sur votre compte.`;
        category = 'success';
        break;
      case 'completed':
        title = "Retrait effectué";
        description = `Votre retrait de ${amount}€ a été effectué avec succès.`;
        category = 'success';
        break;
      case 'rejected':
        title = "Retrait refusé";
        description = `Votre demande de retrait de ${amount}€ a été refusée.${reason ? ` Raison: ${reason}` : ''}`;
        category = 'error';
        break;
      default:
        title = "Statut de retrait mis à jour";
        description = `Le statut de votre retrait de ${amount}€ a été mis à jour: ${status}.`;
    }
    
    return this.createNotification({
      title,
      description,
      type: 'withdrawal',
      category,
      metadata: { amount, status, reason }
    });
  }
}

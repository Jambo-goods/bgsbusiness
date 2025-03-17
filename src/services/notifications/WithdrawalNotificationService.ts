
import { BaseNotificationService } from "./BaseNotificationService";

export class WithdrawalNotificationService extends BaseNotificationService {
  withdrawalRequested(amount: number): Promise<void> {
    return this.createNotification({
      title: "Demande de retrait",
      description: `Votre demande de retrait de ${amount}€ a été enregistrée.`,
      type: 'withdrawal',
      category: 'info',
      metadata: { amount }
    });
  }
  
  withdrawalPending(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait en attente",
      description: `Votre retrait de ${amount}€ est en cours de traitement.`,
      type: 'withdrawal',
      category: 'info',
      metadata: { amount }
    });
  }
  
  withdrawalProcessed(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait traité",
      description: `Votre retrait de ${amount}€ a été traité et sera bientôt dans votre compte bancaire.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount }
    });
  }
  
  withdrawalRejected(amount: number, reason: string): Promise<void> {
    return this.createNotification({
      title: "Retrait rejeté",
      description: `Votre retrait de ${amount}€ a été rejeté. Raison: ${reason}`,
      type: 'withdrawal',
      category: 'error',
      metadata: { amount, reason }
    });
  }
  
  withdrawalScheduled(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait programmé",
      description: `Votre retrait de ${amount}€ a été programmé.`,
      type: 'withdrawal',
      category: 'info',
      metadata: { amount }
    });
  }
  
  withdrawalValidated(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait validé",
      description: `Votre retrait de ${amount}€ a été validé et sera traité prochainement.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount }
    });
  }
  
  withdrawalCompleted(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait finalisé",
      description: `Votre retrait de ${amount}€ a été finalisé et devrait apparaître sur votre compte bancaire.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount }
    });
  }
  
  withdrawalReceived(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait reçu",
      description: `Votre retrait de ${amount}€ a été reçu sur votre compte bancaire.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount }
    });
  }
  
  withdrawalConfirmed(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait confirmé",
      description: `La confirmation de votre retrait de ${amount}€ a été enregistrée.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount }
    });
  }
  
  withdrawalPaid(amount: number): Promise<void> {
    return this.createNotification({
      title: "Retrait payé",
      description: `Votre retrait de ${amount}€ a été payé.`,
      type: 'withdrawal',
      category: 'success',
      metadata: { amount }
    });
  }
}

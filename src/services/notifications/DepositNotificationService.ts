
import { BaseNotificationService } from "./BaseNotificationService";

export class DepositNotificationService extends BaseNotificationService {
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
  
  depositRequested(amount: number, reference: string): Promise<void> {
    return this.createNotification({
      title: "Demande de dépôt envoyée",
      description: `Votre demande de dépôt de ${amount}€ (réf: ${reference}) a été enregistrée.`,
      type: 'deposit',
      category: 'info',
      metadata: { amount, reference }
    });
  }
  
  depositConfirmed(amount: number): Promise<void> {
    return this.createNotification({
      title: "Dépôt confirmé",
      description: `Votre dépôt de ${amount}€ a été validé et ajouté à votre portefeuille.`,
      type: 'deposit',
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
}


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
  
  insufficientFunds(): Promise<void> {
    return this.createNotification({
      title: "Solde insuffisant",
      description: "Solde insuffisant ! Ajoutez des fonds pour investir.",
      type: 'deposit',
      category: 'error'
    });
  }
}

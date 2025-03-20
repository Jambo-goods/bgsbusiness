
import { BaseNotificationService } from "./BaseNotificationService";

export class DepositNotificationService extends BaseNotificationService {
  depositRequested(amount: number, reference: string): Promise<void> {
    return this.createNotification({
      title: "Demande de dépôt",
      description: `Votre dépôt de ${amount}€ a été demandé (réf: ${reference}).`,
      type: 'deposit',
      category: 'info',
      metadata: { amount, reference }
    });
  }
  
  depositConfirmed(amount: number): Promise<void> {
    return this.createNotification({
      title: "Dépôt confirmé",
      description: `Votre dépôt de ${amount}€ a été confirmé et ajouté à votre solde.`,
      type: 'deposit',
      category: 'success',
      metadata: { amount }
    });
  }
  
  depositRejected(amount: number, reason: string): Promise<void> {
    return this.createNotification({
      title: "Dépôt rejeté",
      description: `Votre dépôt de ${amount}€ a été rejeté. Raison: ${reason}`,
      type: 'deposit',
      category: 'error',
      metadata: { amount, reason }
    });
  }
  
  depositSuccess(amount: number): Promise<void> {
    return this.createNotification({
      title: "Dépôt effectué",
      description: `Votre dépôt de ${amount}€ a été ajouté à votre portefeuille.`,
      type: 'deposit',
      category: 'success',
      metadata: { amount }
    });
  }
  
  insufficientFunds(amount: number): Promise<void> {
    return this.createNotification({
      title: "Fonds insuffisants",
      description: `Vous n'avez pas suffisamment de fonds (${amount}€) pour effectuer cette opération.`,
      type: 'deposit',
      category: 'error',
      metadata: { amount }
    });
  }
}


import { BaseNotificationService } from './BaseNotificationService';

export class DepositNotificationService extends BaseNotificationService {
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

  async depositSuccess(amount: number, reference?: string): Promise<void> {
    return this.createNotification({
      title: "Dépôt validé",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été validé et ajouté à votre portefeuille.`,
      type: "deposit",
      category: "success",
      metadata: { 
        amount,
        reference,
        timestamp: new Date().toISOString()
      }
    });
  }

  async depositPending(amount: number, reference?: string): Promise<void> {
    return this.createNotification({
      title: "Dépôt en traitement",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} est en cours de traitement.`,
      type: "deposit",
      category: "info",
      metadata: { 
        amount,
        reference,
        timestamp: new Date().toISOString()
      }
    });
  }

  async depositRejected(amount: number, reference?: string): Promise<void> {
    return this.createNotification({
      title: "Dépôt rejeté",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été rejeté.`,
      type: "deposit",
      category: "error",
      metadata: { 
        amount,
        reference,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export const depositNotificationService = new DepositNotificationService();


import { BaseNotificationService } from "./BaseNotificationService";
import { NotificationCategories } from "./types";

export class DepositNotificationService extends BaseNotificationService {
  async depositRequested(amount: number, reference?: string): Promise<boolean> {
    return this.createNotification({
      title: "Dépôt demandé",
      description: `Votre demande de dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été enregistrée`,
      type: "deposit",
      category: NotificationCategories.info,
      metadata: { 
        amount,
        reference,
        status: "requested",
        timestamp: new Date().toISOString()
      }
    });
  }
  
  async depositReceived(amount: number, reference?: string): Promise<boolean> {
    return this.createNotification({
      title: "Dépôt reçu",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été reçu et est en cours de vérification.`,
      type: "deposit",
      category: NotificationCategories.info,
      metadata: { 
        amount,
        reference,
        status: "received",
        timestamp: new Date().toISOString()
      }
    });
  }
  
  async depositConfirmed(amount: number, reference?: string): Promise<boolean> {
    return this.createNotification({
      title: "Dépôt confirmé",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été confirmé et ajouté à votre portefeuille.`,
      type: "deposit",
      category: NotificationCategories.success,
      metadata: { 
        amount,
        reference,
        status: "confirmed",
        timestamp: new Date().toISOString()
      }
    });
  }
  
  async depositRejected(amount: number, reason?: string, reference?: string): Promise<boolean> {
    return this.createNotification({
      title: "Dépôt refusé",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été refusé${reason ? ` : ${reason}` : '.'}`,
      type: "deposit",
      category: NotificationCategories.error,
      metadata: { 
        amount,
        reference,
        reason,
        status: "rejected",
        timestamp: new Date().toISOString()
      }
    });
  }
}

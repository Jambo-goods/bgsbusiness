
import { BaseNotificationService } from "./BaseNotificationService";
import { NotificationCategory } from "./types";

export class DepositNotificationService extends BaseNotificationService {
  depositRequested(amount: number, reference?: string): Promise<void> {
    return this.createNotification({
      title: "Dépôt demandé",
      description: `Votre demande de dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été enregistrée`,
      type: "deposit",
      category: "info",
      metadata: { 
        amount,
        reference,
        status: "requested",
        timestamp: new Date().toISOString()
      }
    });
  }
  
  depositReceived(amount: number, reference?: string): Promise<void> {
    return this.createNotification({
      title: "Dépôt reçu",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été reçu et est en cours de vérification.`,
      type: "deposit",
      category: "info",
      metadata: { 
        amount,
        reference,
        status: "received",
        timestamp: new Date().toISOString()
      }
    });
  }
  
  depositConfirmed(amount: number, reference?: string): Promise<void> {
    return this.createNotification({
      title: "Dépôt confirmé",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été confirmé et ajouté à votre portefeuille.`,
      type: "deposit",
      category: "success",
      metadata: { 
        amount,
        reference,
        status: "confirmed",
        timestamp: new Date().toISOString()
      }
    });
  }
  
  depositRejected(amount: number, reason?: string, reference?: string): Promise<void> {
    return this.createNotification({
      title: "Dépôt refusé",
      description: `Votre dépôt de ${amount}€${reference ? ` (réf: ${reference})` : ''} a été refusé${reason ? ` : ${reason}` : '.'}`,
      type: "deposit",
      category: "error",
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

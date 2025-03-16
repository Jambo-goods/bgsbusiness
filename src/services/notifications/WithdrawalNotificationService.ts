
import { BaseNotificationService } from "./BaseNotificationService";

export class WithdrawalNotificationService extends BaseNotificationService {
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
}

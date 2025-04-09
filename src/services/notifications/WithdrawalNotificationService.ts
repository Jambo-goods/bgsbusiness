
import { BaseNotificationService } from "./BaseNotificationService";
import { NotificationCategories } from "./types";

export class WithdrawalNotificationService extends BaseNotificationService {
  async withdrawalScheduled(amount: number): Promise<boolean> {
    try {
      return await this.createNotification({
        title: 'Demande de retrait programmée',
        description: `Votre demande de retrait de ${amount}€ a été programmée.`,
        type: 'withdrawal',
        category: NotificationCategories.info,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal scheduled notification:', error);
      return false;
    }
  }

  async withdrawalValidated(amount: number): Promise<boolean> {
    try {
      return await this.createNotification({
        title: 'Demande de retrait validée',
        description: `Votre demande de retrait de ${amount}€ a été validée.`,
        type: 'withdrawal',
        category: NotificationCategories.success,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal validated notification:', error);
      return false;
    }
  }

  async withdrawalCompleted(amount: number): Promise<boolean> {
    try {
      return await this.createNotification({
        title: 'Retrait complété',
        description: `Votre retrait de ${amount}€ a été effectué avec succès.`,
        type: 'withdrawal',
        category: NotificationCategories.success,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal completed notification:', error);
      return false;
    }
  }

  async withdrawalRejected(amount: number): Promise<boolean> {
    try {
      return await this.createNotification({
        title: 'Demande de retrait rejetée',
        description: `Votre demande de retrait de ${amount}€ a été rejetée. Veuillez contacter le support pour plus d'informations.`,
        type: 'withdrawal',
        category: NotificationCategories.error,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal rejected notification:', error);
      return false;
    }
  }

  async withdrawalReceived(amount: number): Promise<boolean> {
    try {
      return await this.createNotification({
        title: 'Demande de retrait reçue',
        description: `Votre demande de retrait de ${amount}€ a été reçue et est en cours de traitement.`,
        type: 'withdrawal',
        category: NotificationCategories.info,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal received notification:', error);
      return false;
    }
  }

  async withdrawalConfirmed(amount: number): Promise<boolean> {
    try {
      return await this.createNotification({
        title: 'Demande de retrait confirmée',
        description: `Votre demande de retrait de ${amount}€ a été confirmée et sera traitée sous peu.`,
        type: 'withdrawal',
        category: NotificationCategories.success,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal confirmed notification:', error);
      return false;
    }
  }

  async withdrawalPaid(amount: number): Promise<boolean> {
    try {
      return await this.createNotification({
        title: 'Retrait payé',
        description: `Votre retrait de ${amount}€ a été payé et devrait apparaître sur votre compte bancaire sous peu.`,
        type: 'withdrawal',
        category: NotificationCategories.success,
        metadata: { amount }
      });
    } catch (error) {
      console.error('Error creating withdrawal paid notification:', error);
      return false;
    }
  }
}

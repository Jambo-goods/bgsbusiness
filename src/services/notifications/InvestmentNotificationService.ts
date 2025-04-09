
import { BaseNotificationService } from "./BaseNotificationService";
import { NotificationCategories } from "./types";

export class InvestmentNotificationService extends BaseNotificationService {
  async investmentConfirmed(projectName: string, amount: number): Promise<boolean> {
    try {
      const result = await this.createNotification({
        title: 'Investissement confirmé',
        description: `Votre investissement de ${amount}€ dans le projet "${projectName}" a été confirmé.`,
        type: 'investment',
        category: NotificationCategories.success,
        metadata: { projectName, amount }
      });
      return result;
    } catch (error) {
      console.error('Error creating investment confirmed notification:', error);
      return false;
    }
  }
}

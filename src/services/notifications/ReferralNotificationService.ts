
import { BaseNotificationService } from "./BaseNotificationService";

export class ReferralNotificationService extends BaseNotificationService {
  referralInvitation(referrerName: string): Promise<void> {
    return this.createNotification({
      title: "Invitation au programme de parrainage",
      description: `${referrerName} vous invite à rejoindre BGS Invest. Inscrivez-vous et obtenez un bonus de 25€.`,
      type: 'marketing',
      category: 'info',
      metadata: { referrerName }
    });
  }
  
  referralBonus(amount: number): Promise<void> {
    return this.createNotification({
      title: "Bonus de parrainage",
      description: `Félicitations ! Vous avez reçu un bonus de ${amount}€ pour avoir utilisé un code de parrainage.`,
      type: 'marketing',
      category: 'success',
      metadata: { amount }
    });
  }
  
  commissionEarned(referredName: string, amount: number): Promise<void> {
    return this.createNotification({
      title: "Commission de parrainage",
      description: `Vous avez reçu ${amount}€ de commission grâce aux gains de votre filleul ${referredName}.`,
      type: 'marketing',
      category: 'success',
      metadata: { referredName, amount }
    });
  }
}

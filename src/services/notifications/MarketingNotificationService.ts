
import { BaseNotificationService } from "./BaseNotificationService";

export class MarketingNotificationService extends BaseNotificationService {
  eventInvitation(eventName: string, date: string): Promise<void> {
    return this.createNotification({
      title: "Invitation à un événement",
      description: `Participez à notre webinaire sur ${eventName} ce ${date}.`,
      type: 'marketing',
      category: 'info',
      metadata: { eventName, date }
    });
  }
  
  specialOffer(percentage: number, endDate: string): Promise<void> {
    return this.createNotification({
      title: "Offre spéciale",
      description: `Profitez d'un bonus de ${percentage}% sur vos investissements jusqu'au ${endDate}.`,
      type: 'marketing',
      category: 'info',
      metadata: { percentage, endDate }
    });
  }
}

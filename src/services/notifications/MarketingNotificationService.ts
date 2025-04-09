
import { BaseNotificationService } from "./BaseNotificationService";
import { NotificationCategories } from "./types";

export class MarketingNotificationService extends BaseNotificationService {
  async newPromotion(title: string, details: string): Promise<boolean> {
    return this.createNotification({
      title: `Nouvelle promotion: ${title}`,
      description: details,
      type: 'marketing',
      category: NotificationCategories.info,
      metadata: { promotion: title }
    });
  }
  
  async platformUpdate(version: string, features: string[]): Promise<boolean> {
    return this.createNotification({
      title: `Mise à jour de la plateforme v${version}`,
      description: `Nouvelles fonctionnalités: ${features.join(", ")}`,
      type: 'marketing',
      category: NotificationCategories.info,
      metadata: { version, features }
    });
  }
  
  async newProjectAnnouncement(projectName: string, projectId: string): Promise<boolean> {
    return this.createNotification({
      title: "Nouveau projet d'investissement",
      description: `Un nouveau projet est disponible: ${projectName}`,
      type: 'marketing',
      category: NotificationCategories.info,
      metadata: { projectName, projectId }
    });
  }

  async newsletter(title: string): Promise<boolean> {
    return this.createNotification({
      title: "Newsletter",
      description: title,
      type: 'marketing',
      category: NotificationCategories.info
    });
  }
}

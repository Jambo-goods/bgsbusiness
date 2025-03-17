
import { BaseNotificationService } from "./BaseNotificationService";

export class MarketingNotificationService extends BaseNotificationService {
  newPromotion(title: string, details: string): Promise<void> {
    return this.createNotification({
      title: `Nouvelle promotion: ${title}`,
      description: details,
      type: 'marketing',
      category: 'info',
      metadata: { promotion: title }
    });
  }
  
  platformUpdate(version: string, features: string[]): Promise<void> {
    return this.createNotification({
      title: `Mise à jour de la plateforme v${version}`,
      description: `Nouvelles fonctionnalités: ${features.join(", ")}`,
      type: 'marketing',
      category: 'info',
      metadata: { version, features }
    });
  }
  
  newProjectAnnouncement(projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Nouveau projet d'investissement",
      description: `Un nouveau projet est disponible: ${projectName}`,
      type: 'marketing',
      category: 'info',
      metadata: { projectName, projectId }
    });
  }

  newsletter(title: string): Promise<void> {
    return this.createNotification({
      title: "Newsletter",
      description: title,
      type: 'marketing',
      category: 'info'
    });
  }
}

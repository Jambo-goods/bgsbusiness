
import { BaseNotificationService } from "./BaseNotificationService";

export class InvestmentNotificationService extends BaseNotificationService {
  investmentConfirmed(projectName: string, amount: number): Promise<void> {
    return this.createNotification({
      title: "Investissement confirmé",
      description: `Votre investissement de ${amount}€ dans le projet "${projectName}" a été confirmé.`,
      type: 'investment',
      category: 'success',
      metadata: { projectName, amount }
    });
  }
  
  investmentReceived(projectName: string, amount: number): Promise<void> {
    return this.createNotification({
      title: "Investissement reçu",
      description: `Nous avons reçu votre investissement de ${amount}€ pour le projet "${projectName}".`,
      type: 'investment',
      category: 'success',
      metadata: { projectName, amount }
    });
  }
  
  projectUpdate(projectName: string, updateType: string, details: string): Promise<void> {
    return this.createNotification({
      title: `Mise à jour: ${projectName}`,
      description: `${updateType}: ${details}`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, updateType, details }
    });
  }
  
  yieldPaid(projectName: string, amount: number, date: string): Promise<void> {
    return this.createNotification({
      title: "Rendement payé",
      description: `Un rendement de ${amount}€ pour votre investissement dans "${projectName}" a été payé le ${date}.`,
      type: 'investment',
      category: 'success',
      metadata: { projectName, amount, date }
    });
  }
  
  investmentMatured(projectName: string, amount: number): Promise<void> {
    return this.createNotification({
      title: "Investissement arrivé à échéance",
      description: `Votre investissement de ${amount}€ dans "${projectName}" est arrivé à échéance.`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, amount }
    });
  }
  
  newInvestmentOpportunity(projectName: string): Promise<void> {
    return this.createNotification({
      title: "Nouvelle opportunité",
      description: `Une nouvelle opportunité d'investissement est disponible: "${projectName}".`,
      type: 'investment',
      category: 'info',
      metadata: { projectName }
    });
  }
  
  projectCompleted(projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Projet terminé",
      description: `Le projet "${projectName}" est maintenant terminé.`,
      type: 'investment',
      category: 'success',
      metadata: { projectName, projectId }
    });
  }
  
  profitReceived(amount: number, projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Profit reçu",
      description: `Vous avez reçu ${amount}€ de profit pour votre investissement dans "${projectName}".`,
      type: 'investment',
      category: 'success',
      metadata: { amount, projectName, projectId }
    });
  }
}

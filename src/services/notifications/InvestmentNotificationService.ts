
import { BaseNotificationService } from "./BaseNotificationService";

export class InvestmentNotificationService extends BaseNotificationService {
  newInvestmentOpportunity(projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Nouvelle opportunité d'investissement",
      description: `Un nouveau projet ${projectName} est disponible ! Investissez dès maintenant.`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, projectId }
    });
  }
  
  investmentConfirmed(amount: number, projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Investissement confirmé",
      description: `Votre investissement de ${amount}€ dans ${projectName} a été confirmé.`,
      type: 'investment',
      category: 'success',
      metadata: { amount, projectName, projectId }
    });
  }
  
  profitReceived(amount: number, projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Rentabilité reçue",
      description: `Vous avez reçu ${amount}€ de bénéfices pour votre investissement dans ${projectName}.`,
      type: 'investment',
      category: 'success',
      metadata: { amount, projectName, projectId }
    });
  }
  
  projectFunded(projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Projet financé",
      description: `Le projet ${projectName} a atteint son financement et démarre bientôt !`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, projectId }
    });
  }
  
  projectCompleted(projectName: string, projectId: string): Promise<void> {
    return this.createNotification({
      title: "Projet terminé",
      description: `Votre investissement dans ${projectName} est terminé. Vérifiez vos bénéfices !`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, projectId }
    });
  }
  
  newOpportunityAlert(projectName: string, projectId: string, expectedYield: string): Promise<void> {
    return this.createNotification({
      title: "Nouvelle opportunité à saisir !",
      description: `Découvrez notre nouveau projet d'investissement ${projectName} avec un rendement attendu de ${expectedYield}. Ne manquez pas cette opportunité !`,
      type: 'investment',
      category: 'info',
      metadata: { projectName, projectId, expectedYield }
    });
  }
}

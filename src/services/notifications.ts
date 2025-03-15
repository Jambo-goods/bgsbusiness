
import { toast } from "sonner";

/**
 * Service de notification utilisant Sonner Toast
 * Ce service remplace l'ancien système de notification basé sur la base de données
 */
export const notificationService = {
  /**
   * Affiche une notification de confirmation d'investissement
   */
  investmentConfirmed: (amount: number, projectName: string, projectId: string) => {
    console.log("Notification: investmentConfirmed", { amount, projectName, projectId });
    toast.success("Investissement confirmé", {
      description: `Votre investissement de ${amount}€ dans ${projectName} a été confirmé.`,
      duration: 5000,
    });
    return Promise.resolve();
  },
  
  /**
   * Affiche une notification pour une nouvelle opportunité d'investissement
   */
  newInvestmentOpportunity: (projectName: string, projectId: string) => {
    console.log("Notification: newInvestmentOpportunity", { projectName, projectId });
    toast.info("Nouvelle opportunité", {
      description: `${projectName} est maintenant disponible pour investissement.`,
      duration: 5000,
    });
    return Promise.resolve();
  },
  
  /**
   * Affiche une notification de dépôt réussi
   */
  depositSuccess: (amount: number) => {
    console.log("Notification: depositSuccess", { amount });
    toast.success("Dépôt réussi", {
      description: `Votre dépôt de ${amount}€ a été crédité sur votre compte.`,
      duration: 5000,
    });
    return Promise.resolve();
  },
  
  /**
   * Affiche une notification de rendement reçu
   */
  yieldReceived: (amount: number, projectName: string) => {
    console.log("Notification: yieldReceived", { amount, projectName });
    toast.success("Rendement reçu", {
      description: `Vous avez reçu ${amount}€ de rendement pour votre investissement dans ${projectName}.`,
      duration: 5000,
    });
    return Promise.resolve();
  },
  
  /**
   * Affiche une notification de statut de retrait
   */
  withdrawalStatus: (amount: number, status: 'pending' | 'processing' | 'completed' | 'rejected') => {
    console.log("Notification: withdrawalStatus", { amount, status });
    
    const statusMessages = {
      pending: "Votre demande de retrait est en attente de traitement.",
      processing: "Votre demande de retrait est en cours de traitement.",
      completed: "Votre retrait a été effectué avec succès.",
      rejected: "Votre demande de retrait a été refusée."
    };
    
    const statusTypes = {
      pending: toast.info,
      processing: toast.info,
      completed: toast.success,
      rejected: toast.error
    };
    
    statusTypes[status](`Retrait de ${amount}€`, {
      description: statusMessages[status],
      duration: 5000,
    });
    
    return Promise.resolve();
  }
};

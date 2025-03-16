
// This file contains functions to show notifications to users
import { toast } from "sonner";

class NotificationService {
  // Show notification for a successful transaction
  transaction(amount: number, type: string) {
    const title = type === 'deposit' 
      ? 'Dépôt effectué' 
      : type === 'withdrawal' 
        ? 'Retrait demandé' 
        : 'Transaction effectuée';
    
    const description = type === 'deposit' 
      ? `Votre dépôt de ${amount}€ a été enregistré` 
      : type === 'withdrawal' 
        ? `Votre demande de retrait de ${amount}€ a été enregistrée` 
        : `Transaction de ${amount}€ effectuée`;
    
    toast.success(title, {
      description
    });
  }
  
  // Show notification for a successful investment
  investment(amount: number, projectName: string) {
    toast.success('Investissement confirmé', {
      description: `Votre investissement de ${amount}€ dans ${projectName} a été enregistré`
    });
  }
  
  // Show notification for a yield received
  yieldReceived(amount: number, projectName: string) {
    try {
      toast.success('Rendement reçu', {
        description: `Vous avez reçu un rendement de ${amount}€ de ${projectName}`
      });
    } catch (error) {
      console.error("Error showing yield notification:", error);
      // Use simple toast if custom toast fails
      toast.success(`Rendement reçu: ${amount}€`);
    }
  }
  
  // Show notification for a new referral
  referral(name: string) {
    toast.success('Nouveau parrainage', {
      description: `${name} a rejoint grâce à votre lien de parrainage`
    });
  }
  
  // Add missing methods to fix build errors
  depositSuccess(amount: number) {
    toast.success('Dépôt effectué', {
      description: `Votre dépôt de ${amount}€ a bien été effectué`
    });
  }
  
  withdrawalStatus(status: string, amount: number) {
    if (status === 'pending') {
      toast.info('Demande de retrait', {
        description: `Votre demande de retrait de ${amount}€ a été enregistrée et est en cours de traitement`
      });
    } else if (status === 'approved') {
      toast.success('Retrait approuvé', {
        description: `Votre retrait de ${amount}€ a été approuvé et sera traité prochainement`
      });
    } else if (status === 'completed') {
      toast.success('Retrait effectué', {
        description: `Votre retrait de ${amount}€ a été effectué avec succès`
      });
    } else if (status === 'rejected') {
      toast.error('Retrait rejeté', {
        description: `Votre demande de retrait de ${amount}€ a été rejetée. Veuillez contacter le support pour plus d'informations`
      });
    }
  }
  
  investmentConfirmed(amount: number, projectName: string) {
    toast.success('Investissement confirmé', {
      description: `Votre investissement de ${amount}€ dans ${projectName} a été confirmé`
    });
  }
  
  announceNewOpportunity(projectName: string) {
    toast.info('Nouvelle opportunité', {
      description: `Une nouvelle opportunité d'investissement est disponible : ${projectName}`
    });
  }
}

export const notificationService = new NotificationService();

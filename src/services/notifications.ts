
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      position: "top-right",
      action: {
        label: "Voir détails",
        onClick: () => {
          window.location.href = `/dashboard`;
        }
      }
    });
    
    // Ensure notification is also recorded in database (important for tracking)
    try {
      // Get current user's session
      return supabase.auth.getSession().then(({ data: sessionData }) => {
        const userId = sessionData.session?.user?.id;
        if (userId) {
          return supabase.from('notifications').insert({
            user_id: userId,
            type: 'investment',
            title: 'Investissement confirmé',
            message: `Votre investissement de ${amount}€ dans ${projectName} a été confirmé.`,
            seen: false,
            data: { amount, projectName, projectId }
          }).then(() => {
            console.log('Successfully created database notification from service');
          }).catch(error => {
            console.error('Error creating database notification from service:', error);
          });
        }
        return Promise.resolve();
      });
    } catch (error) {
      console.error('Error in investmentConfirmed notification:', error);
      return Promise.resolve();
    }
  },
  
  /**
   * Affiche une notification pour une nouvelle opportunité d'investissement
   */
  newInvestmentOpportunity: (projectName: string, projectId: string) => {
    console.log("Notification: newInvestmentOpportunity", { projectName, projectId });
    toast.info("Nouvelle opportunité", {
      description: `${projectName} est maintenant disponible pour investissement.`,
      duration: 5000,
      position: "top-right",
      action: {
        label: "Explorer",
        onClick: () => {
          window.location.href = `/projects/${projectId}`;
        }
      }
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
      position: "top-right",
      action: {
        label: "Voir wallet",
        onClick: () => {
          window.location.href = `/dashboard`;
        }
      }
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
      position: "top-right",
      action: {
        label: "Détails",
        onClick: () => {
          window.location.href = `/dashboard`;
        }
      }
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
      position: "top-right",
      action: {
        label: status === 'rejected' ? "Réessayer" : "Détails",
        onClick: () => {
          window.location.href = `/dashboard`;
        }
      }
    });
    
    return Promise.resolve();
  },
  
  /**
   * Annonce une nouvelle opportunité d'investissement basée sur les données de la BD
   */
  announceNewOpportunity: async (projectId: string) => {
    console.log("Annoncer une nouvelle opportunité pour le projet ID:", projectId);
    
    try {
      // Récupérer les détails du projet depuis la base de données
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération des détails du projet:", error);
        throw error;
      }
      
      if (!project) {
        console.error("Projet non trouvé:", projectId);
        return;
      }
      
      // Afficher la notification
      toast.info("Nouvelle opportunité d'investissement", {
        description: `${project.name} (${project.company_name}) est maintenant disponible pour investissement. Rendement: ${project.yield}%`,
        duration: 7000,
        position: "top-right",
        action: {
          label: "Voir le projet",
          onClick: () => {
            window.location.href = `/projects/${projectId}`;
          }
        }
      });
      
      return Promise.resolve(project);
    } catch (error) {
      console.error("Erreur lors de l'annonce d'une nouvelle opportunité:", error);
      return Promise.reject(error);
    }
  }
};

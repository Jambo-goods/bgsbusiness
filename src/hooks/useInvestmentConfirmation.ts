
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";
import { createProjectInDatabase } from "@/utils/projectUtils";
import { Project } from "@/types/project";
import { useNavigate } from "react-router-dom";

export const useInvestmentConfirmation = (
  project: Project,
  investorCount: number,
  investmentAmount: number,
  selectedDuration: number,
  monthlyReturn: number,
  totalReturn: number,
  userBalance: number,
  firstPaymentDelay: number
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const confirmInvestment = async () => {
    setIsProcessing(true);
    
    try {
      // Get the current user session
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous connecter pour investir",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      const userId = session.session.user.id;
      
      // Make sure we have a valid project ID
      console.log("Création/recherche du projet:", project.name);
      let projectId;
      try {
        projectId = await createProjectInDatabase(project, toast);
        if (!projectId) {
          throw new Error("Impossible de déterminer l'identifiant du projet");
        }
        console.log("ID du projet utilisé:", projectId);
      } catch (projectError) {
        console.error("Erreur lors de la création/recherche du projet:", projectError);
        toast({
          title: "Erreur avec le projet",
          description: "Impossible de créer ou trouver le projet. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Update the user's wallet balance
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: userId, increment_amount: -investmentAmount }
      );
      
      if (walletError) {
        console.error("Erreur lors de la mise à jour du portefeuille:", walletError);
        throw walletError;
      }
      
      // Create the investment record
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: projectId,
          amount: investmentAmount,
          duration: selectedDuration,
          yield_rate: project.yield,
          status: 'active',
          date: new Date().toISOString()
        });
      
      if (investmentError) {
        console.error("Erreur lors de la création de l'investissement:", investmentError);
        throw investmentError;
      }
      
      // Create scheduled payments for this investment
      try {
        const currentDate = new Date();
        
        // Create a single record for payment scheduling - with correct fields
        const { error: schedulingError } = await supabase
          .from('scheduled_payments')
          .insert({
            project_id: projectId,
            payment_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + firstPaymentDelay, 1).toISOString(),
            status: 'scheduled',
            percentage: project.yield,
            investors_count: investorCount,
            total_invested_amount: investmentAmount,
            total_scheduled_amount: monthlyReturn
          });
            
        if (schedulingError) {
          console.error("Erreur lors de la programmation des paiements:", schedulingError);
          // Continue execution even if scheduling fails
        }
      } catch (schedulingError) {
        console.error("Erreur lors de la programmation des paiements:", schedulingError);
        // Continue execution even if payment scheduling fails
      }
      
      // Update user profile with investment info
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count')
        .eq('id', userId)
        .single();
      
      if (profileFetchError) {
        console.error("Erreur lors de la récupération du profil:", profileFetchError);
        throw profileFetchError;
      }
      
      const updates = {
        investment_total: (profileData.investment_total || 0) + investmentAmount,
        projects_count: (profileData.projects_count || 0) + 1
      };
      
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (profileUpdateError) {
        console.error("Erreur lors de la mise à jour du profil:", profileUpdateError);
        throw profileUpdateError;
      }
      
      // Record the transaction in wallet history
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: -investmentAmount,
          type: 'withdrawal',
          description: `Investissement dans ${project.name}`,
          status: 'completed'
        });
      
      if (transactionError) {
        console.error("Erreur lors de l'enregistrement de la transaction:", transactionError);
        throw transactionError;
      }
      
      // Save investment data for confirmation page
      const investmentData = {
        projectId: projectId,
        projectName: project.name,
        amount: investmentAmount,
        duration: selectedDuration,
        yield: project.yield,
        date: new Date().toISOString(),
        monthlyReturn: monthlyReturn,
        totalReturn: totalReturn,
        firstPaymentDelay: firstPaymentDelay
      };
      
      localStorage.setItem("recentInvestment", JSON.stringify(investmentData));
      
      // Create confirmation notification
      try {
        console.log("Création de la notification d'investissement confirmé");
        await notificationService.investmentConfirmed(investmentAmount, project.name, projectId);
        console.log("Notification d'investissement confirmé créée avec succès");
      } catch (notifError) {
        console.error("Erreur lors de la création de la notification d'investissement:", notifError);
        // Continue execution even if notification creation fails
      }
      
      toast({
        title: "Investissement réussi !",
        description: `Vous avez investi ${investmentAmount}€ dans ${project.name} pour une durée de ${selectedDuration} mois.`,
      });
      
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Erreur lors de l'investissement:", error);
      toast({
        title: "Erreur lors de l'investissement",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de votre investissement.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    confirmInvestment
  };
};

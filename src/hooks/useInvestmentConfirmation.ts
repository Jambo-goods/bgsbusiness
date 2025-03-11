
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
        console.error("No active session found");
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous connecter pour investir",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      const userId = session.session.user.id;
      
      // Double check user balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error("Error fetching user balance:", profileError);
        throw new Error("Impossible de vérifier votre solde");
      }
      
      if (!profile || profile.wallet_balance < investmentAmount) {
        console.error("Insufficient funds:", profile?.wallet_balance, "needed:", investmentAmount);
        toast({
          title: "Solde insuffisant",
          description: "Votre solde est insuffisant pour cet investissement",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
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
        throw new Error("Erreur avec le projet: " + (projectError instanceof Error ? projectError.message : "Erreur inconnue"));
      }
      
      // Create the investment record first
      console.log("Création de l'investissement...", {
        user_id: userId,
        project_id: projectId,
        amount: investmentAmount,
        duration: selectedDuration,
        yield_rate: project.yield
      });

      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: projectId,
          amount: investmentAmount,
          duration: selectedDuration,
          yield_rate: project.yield,
          status: 'active',
          date: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (investmentError) {
        console.error("Erreur lors de la création de l'investissement:", investmentError);
        throw new Error("Impossible de créer l'investissement: " + investmentError.message);
      }

      if (!investment) {
        throw new Error("L'investissement n'a pas été créé correctement");
      }
      
      // Update the user's wallet balance
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: userId, increment_amount: -investmentAmount }
      );
      
      if (walletError) {
        console.error("Erreur lors de la mise à jour du portefeuille:", walletError);
        // Rollback the investment if wallet update fails
        await supabase
          .from('investments')
          .delete()
          .eq('id', investment.id);
        throw new Error("Erreur lors de la mise à jour de votre portefeuille");
      }
      
      // Update scheduled payments
      try {
        await supabase.rpc('initialize_project_scheduled_payments', {
          project_uuid: projectId
        });
      } catch (schedulingError) {
        console.error("Erreur lors de la programmation des paiements:", schedulingError);
        // Continue execution even if scheduling fails
      }
      
      // Update user profile with investment info
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          investment_total: supabase.rpc('increment', { row_id: userId, value: investmentAmount }),
          projects_count: supabase.rpc('increment', { row_id: userId, value: 1 })
        })
        .eq('id', userId);
      
      if (profileUpdateError) {
        console.error("Erreur lors de la mise à jour du profil:", profileUpdateError);
        // Non-critical error, continue execution
      }
      
      // Save investment data for confirmation page
      const investmentData = {
        projectId,
        projectName: project.name,
        amount: investmentAmount,
        duration: selectedDuration,
        yield: project.yield,
        date: new Date().toISOString(),
        monthlyReturn,
        totalReturn,
        firstPaymentDelay
      };
      
      localStorage.setItem("recentInvestment", JSON.stringify(investmentData));
      
      // Create confirmation notification
      try {
        await notificationService.investmentConfirmed(investmentAmount, project.name, projectId);
      } catch (notifError) {
        console.error("Erreur lors de la création de la notification:", notifError);
        // Continue execution even if notification fails
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

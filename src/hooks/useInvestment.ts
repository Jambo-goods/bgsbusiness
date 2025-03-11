
import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createProjectInDatabase } from "@/utils/projectUtils";
import { notificationService } from "@/services/notifications";

export const useInvestment = (project: Project, investorCount: number) => {
  const [investmentAmount, setInvestmentAmount] = useState(project.minInvestment || 500);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(
    project.possibleDurations ? project.possibleDurations[0] : parseInt(project.duration)
  );
  const [totalReturn, setTotalReturn] = useState(0);
  const [monthlyReturn, setMonthlyReturn] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const minInvestment = project.minInvestment;
  const maxInvestment = project.maxInvestment || 10000;
  const firstPaymentDelay = project.firstPaymentDelayMonths || 1;
  
  const durations = project.possibleDurations || 
    [parseInt(project.duration.split(' ')[0])];
  
  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', session.session.user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUserBalance(data.wallet_balance || 0);
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
      }
    };
    
    fetchUserBalance();
  }, []);
  
  useEffect(() => {
    const calculatedMonthlyReturn = investmentAmount * (project.yield / 100);
    const effectiveDuration = selectedDuration - firstPaymentDelay;
    const calculatedTotalReturn = investmentAmount + (calculatedMonthlyReturn * Math.max(0, effectiveDuration));
    
    setMonthlyReturn(calculatedMonthlyReturn);
    setTotalReturn(calculatedTotalReturn);
  }, [investmentAmount, selectedDuration, project.yield, firstPaymentDelay]);
  
  const handleInvest = () => {
    if (userBalance < investmentAmount) {
      toast({
        title: "Solde insuffisant",
        description: `Vous n'avez pas assez de fonds disponibles. Votre solde: ${userBalance}€`,
        variant: "destructive"
      });
      
      // Create insufficient funds notification
      notificationService.insufficientFunds();
      return;
    }
    
    setShowConfirmation(true);
  };
  
  const cancelInvestment = () => {
    setShowConfirmation(false);
  };

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
        
        // Create individual scheduled payments for each month
        for (let i = firstPaymentDelay; i < selectedDuration; i++) {
          const paymentDate = new Date(currentDate);
          paymentDate.setMonth(currentDate.getMonth() + i);
          
          const { error: scheduledPaymentError } = await supabase
            .from('scheduled_payments')
            .insert({
              user_id: userId,
              project_id: projectId,
              payment_date: paymentDate.toISOString(),
              payment_amount: monthlyReturn,
              status: 'scheduled',
              percentage: project.yield,
              // Don't use total_invested_amount field as it may not exist
              investors_count: null,
              cumulative_amount: null
            });
            
          if (scheduledPaymentError) {
            console.error(`Erreur lors de la programmation du paiement ${i}:`, scheduledPaymentError);
            // Continue avec les autres paiements même si celui-ci échoue
          }
        }
      } catch (schedulingError) {
        console.error("Erreur lors de la programmation des paiements:", schedulingError);
        // Continue l'exécution même si la programmation des paiements échoue
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
      setShowConfirmation(false);
    }
  };

  return {
    investmentAmount,
    setInvestmentAmount,
    showConfirmation,
    setShowConfirmation,
    isProcessing,
    selectedDuration,
    setSelectedDuration,
    totalReturn,
    monthlyReturn,
    minInvestment,
    maxInvestment,
    durations,
    handleInvest,
    cancelInvestment,
    confirmInvestment
  };
};

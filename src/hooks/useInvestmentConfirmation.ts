import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createProjectInDatabase } from "@/utils/projectUtils";
import { Project } from "@/types/project";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notifications";

const validateUserSession = async () => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    console.error("No active session found");
    throw new Error("Veuillez vous connecter pour investir");
  }
  
  return session.session.user.id;
};

const verifyUserBalance = async (userId: string, investmentAmount: number) => {
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
    throw new Error("Solde insuffisant pour cet investissement");
  }
  
  return profile.wallet_balance;
};

const createInvestmentRecord = async (userId: string, projectId: string, investmentAmount: number, selectedDuration: number, yieldRate: number) => {
  console.log("Création de l'investissement...", {
    user_id: userId,
    project_id: projectId,
    amount: investmentAmount,
    duration: selectedDuration,
    yield_rate: yieldRate
  });

  const { data: investment, error: investmentError } = await supabase
    .from('investments')
    .insert({
      user_id: userId,
      project_id: projectId,
      amount: investmentAmount,
      duration: selectedDuration,
      yield_rate: yieldRate,
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
  
  return investment.id;
};

const createInvestmentTransaction = async (userId: string, projectId: string, projectName: string, investmentAmount: number) => {
  const { data: transaction, error: transactionError } = await supabase
    .from('wallet_transactions')
    .insert({
      user_id: userId,
      amount: investmentAmount,
      type: 'withdrawal',
      status: 'completed',
      description: `Investissement dans ${projectName}`
    })
    .select('id')
    .single();
    
  if (transactionError) {
    console.error("Erreur lors de la création de la transaction:", transactionError);
    // Non-critical error, continue execution
  }
  
  return transaction?.id;
};

const updateUserWalletBalance = async (userId: string, investmentAmount: number) => {
  const { error: walletError } = await supabase.rpc(
    'increment_wallet_balance', 
    { user_id: userId, increment_amount: -investmentAmount }
  );
  
  if (walletError) {
    console.error("Erreur lors de la mise à jour du portefeuille:", walletError);
    throw new Error("Erreur lors de la mise à jour de votre portefeuille");
  }
};

const updateUserProfile = async (userId: string, investmentAmount: number, yieldRate: number) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('investment_total, projects_count')
    .eq('id', userId)
    .single();
    
  if (profileError) {
    console.error("Error fetching profile:", profileError);
    throw new Error("Erreur lors de la mise à jour du profil");
  }

  const newInvestmentTotal = (profile?.investment_total || 0) + investmentAmount;
  const newProjectsCount = (profile?.projects_count || 0) + 1;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      investment_total: newInvestmentTotal,
      projects_count: newProjectsCount
    })
    .eq('id', userId);
  
  if (updateError) {
    console.error("Erreur lors de la mise à jour du profil:", updateError);
    throw new Error("Erreur lors de la mise à jour du profil");
  }
};

const updateScheduledPayments = async (projectId: string) => {
  try {
    await supabase.rpc('initialize_project_scheduled_payments', {
      project_uuid: projectId
    });
  } catch (error) {
    console.error("Erreur lors de la programmation des paiements:", error);
    // Non-critical error, continue execution
  }
};

const saveInvestmentData = (projectId: string, projectName: string, investmentAmount: number, selectedDuration: number, yieldRate: number, monthlyReturn: number, totalReturn: number, firstPaymentDelay: number) => {
  const investmentData = {
    projectId,
    projectName,
    amount: investmentAmount,
    duration: selectedDuration,
    yield: yieldRate,
    date: new Date().toISOString(),
    monthlyReturn,
    totalReturn,
    firstPaymentDelay
  };
  
  localStorage.setItem("recentInvestment", JSON.stringify(investmentData));
};

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
      const userId = await validateUserSession();
      
      await verifyUserBalance(userId, investmentAmount);
      
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
      
      const investmentId = await createInvestmentRecord(userId, projectId, investmentAmount, selectedDuration, project.yield);
      
      try {
        await createInvestmentTransaction(userId, projectId, project.name, investmentAmount);
        
        await updateUserWalletBalance(userId, investmentAmount);
        
        await updateScheduledPayments(projectId);
        
        await updateUserProfile(userId, investmentAmount, project.yield);
        
        saveInvestmentData(
          projectId, 
          project.name, 
          investmentAmount, 
          selectedDuration, 
          project.yield, 
          monthlyReturn, 
          totalReturn, 
          firstPaymentDelay
        );
        
        console.log(`Investissement réussi: ${investmentAmount}€ dans ${project.name} pour ${selectedDuration} mois`);
        
        toast({
          title: "Investissement réussi !",
          description: `Vous avez investi ${investmentAmount}€ dans ${project.name} pour une durée de ${selectedDuration} mois.`,
        });
        
        try {
          console.log('Creating direct investment notification from confirmation hook');
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'investment',
            title: 'Investissement confirmé',
            message: `Votre investissement de ${investmentAmount}€ dans ${project.name} a été confirmé.`,
            seen: false,
            data: {
              projectId,
              projectName: project.name,
              amount: investmentAmount,
              duration: selectedDuration
            }
          });
        } catch (error) {
          console.error('Error creating direct investment notification:', error);
        }
        
        notificationService.investmentConfirmed(investmentAmount, project.name, projectId);
        
        navigate("/dashboard");
      } catch (error) {
        console.error("Error after investment creation, attempting rollback:", error);
        try {
          if (investmentId) {
            await supabase.from('investments').delete().eq('id', investmentId);
            console.log("Rolled back investment:", investmentId);
          }
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }
        throw error;
      }
      
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

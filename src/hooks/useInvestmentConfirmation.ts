
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";
import { Project } from "@/types/project";
import { useNavigate } from "react-router-dom";

// Calculate total expected return
const calculateTotalReturn = (investmentAmount: number, yieldPerc: number, durationMonths: number) => {
  const monthlyYield = yieldPerc / 100;
  return investmentAmount + (investmentAmount * monthlyYield * durationMonths);
};

// Save investment to supabase
const saveInvestment = async (
  projectId: string, 
  investmentAmount: number, 
  project: Project,
  userId: string,
  duration: number
) => {
  try {
    const { error } = await supabase
      .from("investments")
      .insert({
        user_id: userId,
        project_id: projectId,
        amount: investmentAmount,
        status: "active",
        yield_rate: project.yield,
        duration: duration // Add the duration field
      });

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'investissement:", error);
    return { success: false, error };
  }
};

// Update project stats (removing investors_count as it doesn't exist)
const updateProjectStats = async (
  projectId: string, 
  totalRaised: number,
  investmentAmount: number
) => {
  try {
    const { error } = await supabase
      .from("projects")
      .update({
        total_raised: totalRaised + investmentAmount
      })
      .eq("id", projectId);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques du projet:", error);
    return { success: false, error };
  }
};

// Record the amount in wallet transactions
const recordWalletTransaction = async (
  userId: string,
  investmentAmount: number,
  projectName: string
) => {
  try {
    const { error } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: userId,
        amount: investmentAmount,
        type: "investment",
        description: `Investissement dans ${projectName}`,
        status: "completed"
      });

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la transaction:", error);
    return { success: false, error };
  }
};

// Update user wallet balance
const updateWalletBalance = async (
  userId: string,
  currentBalance: number,
  investmentAmount: number
) => {
  try {
    if (currentBalance < investmentAmount) {
      throw new Error("Solde insuffisant");
    }
    
    const { error } = await supabase
      .from("profiles")
      .update({
        wallet_balance: currentBalance - investmentAmount
      })
      .eq("id", userId);

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du solde:", error);
    return { success: false, error };
  }
};

// Store payment records for this investment
const storePaymentSchedule = async (
  projectId: string,
  userId: string,
  investmentAmount: number,
  yieldPerc: number,
  durationMonths: number,
  firstPaymentDelay: number
) => {
  // Logic to calculate and store expected payment schedule
  // Implementation here
};

// Store recent investment in local storage
const storeRecentInvestment = (investmentData: any) => {
  localStorage.setItem("recentInvestment", JSON.stringify(investmentData));
};

// Create confirmation notification
const createConfirmationNotification = async (investmentAmount: number, projectName: string, projectId: string) => {
  try {
    await notificationService.investmentConfirmed(investmentAmount, projectName, projectId);
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    // Non-critical error, continue execution
  }
};

export const useInvestmentConfirmation = (
  project: Project,
  investorCount: number,
  totalRaised: number,
  onClose: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const confirmInvestment = async (investmentAmount: number, selectedDuration: number = 24) => {
    if (!investmentAmount || investmentAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant d'investissement valide.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Fetch user details
    const { data: userDetails, error: userError } = await supabase.auth.getUser();
    if (userError || !userDetails?.user) {
      toast({
        title: "Erreur d'authentification",
        description: "Impossible de récupérer les informations de l'utilisateur.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    const user = userDetails.user;

    // Fetch user profile to get current wallet balance
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      toast({
        title: "Erreur de profil",
        description: "Impossible de récupérer le solde du portefeuille.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const currentBalance = profileData.wallet_balance || 0;
    const projectId = project.id;
    const durationMonths = selectedDuration;
    const firstPaymentDelay = project.firstPaymentDelayMonths || 1;

    try {
      // Step 1: Save investment
      const { success: saveSuccess, error: saveError } = await saveInvestment(
        projectId,
        investmentAmount,
        project,
        user.id,
        durationMonths // Pass the duration to saveInvestment
      );
      if (!saveSuccess || saveError) throw new Error("Erreur lors de l'enregistrement de l'investissement");

      // Step 2: Update project stats (removed investorCount parameter)
      const { success: statsSuccess, error: statsError } = await updateProjectStats(
        projectId,
        totalRaised,
        investmentAmount
      );
      if (!statsSuccess || statsError) throw new Error("Erreur lors de la mise à jour des statistiques du projet");

      // Step 3: Record wallet transaction
      const { success: recordSuccess, error: recordError } = await recordWalletTransaction(
        user.id,
        investmentAmount,
        project.name
      );
      if (!recordSuccess || recordError) throw new Error("Erreur lors de l'enregistrement de la transaction");

      // Step 4: Update wallet balance
      const { success: balanceSuccess, error: balanceError } = await updateWalletBalance(
        user.id,
        currentBalance,
        investmentAmount
      );
      if (!balanceSuccess || balanceError) throw new Error("Erreur lors de la mise à jour du solde");
      
      // Calculate total expected return
      const totalReturn = calculateTotalReturn(
        investmentAmount, 
        project.yield, 
        durationMonths
      );
      
      // Store payment schedule if this is not a test/demo environment
      if (process.env.NODE_ENV !== "development") {
        await storePaymentSchedule(
          projectId, 
          user.id, 
          investmentAmount, 
          project.yield, 
          durationMonths, 
          firstPaymentDelay
        );
        
        // Create confirmation notification - non-critical
        await createConfirmationNotification(investmentAmount, project.name, projectId);
      }
      
      toast({
        title: "Investissement réussi !",
        description: `Vous avez investi ${investmentAmount}€ dans ${project.name}.`,
      });
      
      // Store recent investment in local storage
      storeRecentInvestment({
        projectName: project.name,
        amount: investmentAmount,
        expectedReturn: totalReturn,
      });

      // Close the modal and navigate to dashboard
      onClose();
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Erreur lors de la confirmation de l'investissement:", error);
      toast({
        title: "Erreur d'investissement",
        description: error.message || "Une erreur est survenue lors de la confirmation de l'investissement.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    confirmInvestment,
    isLoading,
  };
};

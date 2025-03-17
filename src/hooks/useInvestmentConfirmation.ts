import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";

export interface InvestmentConfirmationHook {
  confirmationStatus: "idle" | "processing" | "success" | "error";
  loadingMessage: string | null;
  errorMessage: string | null;
  successAmount: number | null;
  successProject: string | null;
  confirmInvestment: (amount: number) => Promise<boolean>;
}

export default function useInvestmentConfirmation(projectId: string) {
  const [confirmationStatus, setConfirmationStatus] = useState<InvestmentConfirmationHook["confirmationStatus"]>("idle");
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successAmount, setSuccessAmount] = useState<number | null>(null);
  const [successProject, setSuccessProject] = useState<string | null>(null);

  const confirmInvestment = async (amount: number) => {
    try {
      setConfirmationStatus("processing");
      setLoadingMessage("Traitement de votre investissement...");

      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setConfirmationStatus("error");
        setErrorMessage("Vous devez être connecté pour investir");
        return false;
      }

      const userId = sessionData.session.user.id;

      // Check if user has enough balance
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        setConfirmationStatus("error");
        setErrorMessage("Impossible de vérifier votre solde");
        return false;
      }

      if (!userProfile || userProfile.wallet_balance < amount) {
        console.error("Insufficient funds:", userProfile?.wallet_balance, "needed:", amount);
        setConfirmationStatus("error");
        setErrorMessage("Solde insuffisant pour cet investissement");
        return false;
      }

      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('name, yield')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error("Error fetching project details:", projectError);
        setConfirmationStatus("error");
        setErrorMessage("Impossible de récupérer les détails du projet");
        return false;
      }

      // 1. Update wallet balance
      const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: -amount // Negative to decrease balance
      });

      if (walletError) {
        console.error("Error updating wallet balance:", walletError);
        setConfirmationStatus("error");
        setErrorMessage("Erreur lors de la mise à jour du solde");
        return false;
      }

      // 2. Create investment record
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: projectId,
          amount: amount,
          status: 'active',
          yield_rate: project.yield,
          investment_date: new Date().toISOString()
        });

      if (investmentError) {
        console.error("Error creating investment:", investmentError);
        
        // Rollback wallet balance change
        await supabase.rpc('increment_wallet_balance', {
          user_id: userId,
          increment_amount: amount
        });
        
        setConfirmationStatus("error");
        setErrorMessage("Erreur lors de la création de l'investissement");
        return false;
      }

      // 3. Update user profile investment stats
      const { error: updateProfileError } = await supabase.rpc('update_user_profile_investment', {
        user_id: userId,
        investment_amount: amount
      });

      if (updateProfileError) {
        console.error("Error updating profile stats:", updateProfileError);
        // Non-critical error, continue
      }

      // 4. Create wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'investment',
          status: 'completed',
          description: `Investissement dans ${project.name}`
        });

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        // Non-critical error, continue
      }

      // 5. Create notification
      notificationService.investmentConfirmed(amount, project.name, project.yield);

      // Success!
      setConfirmationStatus("success");
      setSuccessAmount(amount);
      setSuccessProject(project.name);
      
      return true;
    } catch (error) {
      console.error("Investment error:", error);
      setConfirmationStatus("error");
      setErrorMessage("Une erreur est survenue lors de la confirmation de l'investissement");
      return false;
    }
  };

  return {
    confirmationStatus,
    loadingMessage,
    errorMessage,
    successAmount,
    successProject,
    confirmInvestment
  };
}

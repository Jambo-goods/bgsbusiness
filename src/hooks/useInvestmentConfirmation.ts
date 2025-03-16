
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";
import { toast } from "sonner";

interface UseInvestmentConfirmationProps {
  userId: string;
  projectId: string;
  amount: number;
  duration: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useInvestmentConfirmation = ({
  userId,
  projectId,
  amount,
  duration,
  onSuccess,
  onError
}: UseInvestmentConfirmationProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const confirmInvestment = async (): Promise<boolean> => {
    setIsConfirming(true);
    setError("");
    
    try {
      // Get user profile data for wallet balance
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance, first_name, last_name")
        .eq("id", userId)
        .single();
        
      if (profileError) {
        throw new Error("Impossible de récupérer les informations du profil");
      }
      
      // Get project data for validating investment
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("name, min_investment, max_investment, monthly_yield_percentage")
        .eq("id", projectId)
        .single();
        
      if (projectError) {
        throw new Error("Impossible de récupérer les informations du projet");
      }
      
      // Check if user has enough balance
      if (profileData.wallet_balance < amount) {
        throw new Error(`Solde insuffisant (${profileData.wallet_balance}€) pour investir ${amount}€`);
      }
      
      // Check if investment amount is within project limits
      if (amount < projectData.min_investment) {
        throw new Error(`Le montant minimum d'investissement pour ce projet est de ${projectData.min_investment}€`);
      }
      
      if (amount > projectData.max_investment) {
        throw new Error(`Le montant maximum d'investissement pour ce projet est de ${projectData.max_investment}€`);
      }
      
      // Start database transaction
      // Insert new investment record
      const { data: investmentData, error: investmentError } = await supabase
        .from("investments")
        .insert({
          user_id: userId,
          project_id: projectId,
          amount: amount,
          duration_months: duration,
          monthly_yield_percentage: projectData.monthly_yield_percentage,
          status: "active"
        })
        .select()
        .single();
        
      if (investmentError) {
        throw new Error("Erreur lors de la création de l'investissement");
      }
      
      // Update user wallet balance
      const newBalance = profileData.wallet_balance - amount;
      const { error: updateBalanceError } = await supabase
        .from("profiles")
        .update({ 
          wallet_balance: newBalance,
          // Increment investment_total if it exists
          investment_total: supabase.rpc("increment_wallet_balance", { amount: amount }),
          projects_count: supabase.rpc("increment_wallet_balance", { amount: 1 })
        })
        .eq("id", userId);
        
      if (updateBalanceError) {
        throw new Error("Erreur lors de la mise à jour du solde");
      }
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: userId,
          amount: amount,
          type: "investment",
          description: `Investissement dans le projet ${projectData.name}`,
          status: "completed",
          investment_id: investmentData.id
        });
        
      if (transactionError) {
        throw new Error("Erreur lors de l'enregistrement de la transaction");
      }
      
      // Send notification
      notificationService.investmentConfirmed(amount, projectData.name, projectId);
      
      // Send success toast
      toast.success("Investissement confirmé", {
        description: `Votre investissement de ${amount}€ dans ${projectData.name} a été enregistré avec succès.`
      });
      
      setIsSuccess(true);
      if (onSuccess) onSuccess();
      return true;
      
    } catch (err) {
      console.error("Investment confirmation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      
      // Send error toast
      toast.error("Erreur d'investissement", {
        description: errorMessage
      });
      
      if (onError) onError(errorMessage);
      return false;
    } finally {
      setIsConfirming(false);
    }
  };
  
  return {
    isConfirming,
    isSuccess,
    error,
    confirmInvestment
  };
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useInvestmentConfirmation(projectId: string, amount: number) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Reset state when project or amount changes
  useEffect(() => {
    setIsConfirming(false);
    setIsSuccess(false);
    setError(null);
  }, [projectId, amount]);

  const confirmInvestment = async () => {
    if (!projectId || amount <= 0) {
      setError("Projet ou montant invalide");
      toast.error("Erreur d'investissement", {
        description: "Projet ou montant invalide"
      });
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error("Erreur d'authentification");
      }
      
      if (!sessionData.session) {
        throw new Error("Veuillez vous connecter pour investir");
      }
      
      const userId = sessionData.session.user.id;
      
      // Check user's wallet balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('wallet_balance, first_name, last_name')
        .eq('id', userId)
        .single();
      
      if (userError) {
        throw new Error("Erreur de récupération des données utilisateur");
      }
      
      if (!userData || userData.wallet_balance < amount) {
        throw new Error("Solde insuffisant pour cet investissement");
      }
      
      // Get project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name, yield, min_investment, funding_progress, raised')
        .eq('id', projectId)
        .single();
      
      if (projectError || !projectData) {
        throw new Error("Projet non trouvé");
      }
      
      if (amount < projectData.min_investment) {
        throw new Error(`L'investissement minimum est de ${projectData.min_investment}€`);
      }
      
      console.log("Confirming investment:", {
        projectId,
        userId,
        amount,
        currentBalance: userData.wallet_balance
      });
      
      // Start transaction
      // 1. Deduct amount from wallet
      const newBalance = userData.wallet_balance - amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          wallet_balance: newBalance,
          investment_total: supabase.rpc('coalesce', { val: 'investment_total' }, { count: 'exact' }) + amount,
          projects_count: supabase.rpc('coalesce', { val: 'projects_count' }, { count: 'exact' }) + 1
        })
        .eq('id', userId);
      
      if (updateError) {
        throw new Error("Erreur lors de la mise à jour du solde");
      }
      
      // 2. Create transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'investment',
          description: `Investissement dans ${projectData.name}`,
          status: 'completed'
        });
      
      if (transactionError) {
        // Revert wallet balance change if transaction record fails
        await supabase
          .from('profiles')
          .update({ wallet_balance: userData.wallet_balance })
          .eq('id', userId);
        throw new Error("Erreur lors de l'enregistrement de la transaction");
      }
      
      // 3. Create investment record
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: projectId,
          amount: amount,
          yield_rate: projectData.yield,
          duration: 12, // Default to 12 months
          status: 'active'
        })
        .select()
        .single();
      
      if (investmentError) {
        // Revert wallet balance change if investment record fails
        await supabase
          .from('profiles')
          .update({ wallet_balance: userData.wallet_balance })
          .eq('id', userId);
        throw new Error("Erreur lors de la création de l'investissement");
      }
      
      // 4. Update project funding progress
      const newRaised = (projectData.raised || 0) + amount;
      const { error: projectUpdateError } = await supabase
        .from('projects')
        .update({
          raised: newRaised,
          funding_progress: Math.min(100, Math.round((newRaised / 100000) * 100)) // Assuming target is 100,000€
        })
        .eq('id', projectId);
      
      if (projectUpdateError) {
        console.error("Error updating project funding:", projectUpdateError);
        // We continue even if this fails since the investment was created
      }
      
      // Transaction successful
      setIsSuccess(true);
      toast.success("Investissement réussi", { 
        description: `Vous avez investi ${amount}€ dans ${projectData.name}`
      });
      
      // Create notification
      try {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'investment',
          title: 'Nouvel investissement',
          message: `Votre investissement de ${amount}€ dans ${projectData.name} a été confirmé.`,
          seen: false,
          data: { investment_id: investment.id, project_id: projectId, amount }
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
      
      // Delay before redirecting to dashboard
      setTimeout(() => {
        navigate('/dashboard?tab=investments');
      }, 2000);
      
      return true;
    } catch (err) {
      console.error("Investment confirmation error:", err);
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      
      toast.error("Échec de l'investissement", { 
        description: errorMessage 
      });
      
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
}

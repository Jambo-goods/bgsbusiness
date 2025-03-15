
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project } from "@/types/project";

export function useInvestment(project: Project) {
  const [isInvesting, setIsInvesting] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(project.min_investment || 1500);
  const [investmentSuccess, setInvestmentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmInvestment = async () => {
    try {
      setIsInvesting(true);
      setError(null);
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error("Erreur lors de la récupération de votre session : " + sessionError.message);
      }
      
      if (!sessionData.session) {
        throw new Error("Veuillez vous connecter pour investir");
      }
      
      const userId = sessionData.session.user.id;
      
      // Check wallet balance
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw new Error("Erreur lors de la récupération de votre profil : " + profileError.message);
      }
      
      const walletBalance = profileData?.wallet_balance || 0;
      
      if (walletBalance < investmentAmount) {
        throw new Error(`Solde insuffisant. Vous avez ${walletBalance}€ dans votre portefeuille.`);
      }
      
      // Create investment record
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: project.id,
          amount: investmentAmount,
          status: 'active',
          created_at: new Date().toISOString(),
          duration: project.duration,
          yield_rate: project.yield
        });
      
      if (investmentError) {
        throw new Error("Erreur lors de la création de l'investissement : " + investmentError.message);
      }
      
      // Deduct from wallet balance
      const { error: walletError } = await supabase
        .from('profiles')
        .update({ 
          wallet_balance: walletBalance - investmentAmount,
          investment_total: (profileData?.investment_total || 0) + investmentAmount,
          projects_count: (profileData?.projects_count || 0) + 1
        })
        .eq('id', userId);
      
      if (walletError) {
        throw new Error("Erreur lors de la mise à jour du portefeuille : " + walletError.message);
      }
      
      // Create a wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: investmentAmount,
          type: 'investment',
          description: `Investissement dans ${project.name}`,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      
      if (transactionError) {
        console.error("Erreur lors de l'enregistrement de la transaction :", transactionError);
      }
      
      // All operations successful
      toast.success("Investissement réussi !", {
        description: `Vous avez investi ${investmentAmount}€ dans ${project.name}`
      });
      
      setInvestmentSuccess(true);
      
    } catch (err: any) {
      console.error("Erreur d'investissement:", err);
      setError(err.message || "Une erreur s'est produite lors de l'investissement");
      toast.error("Erreur d'investissement", {
        description: err.message || "Une erreur s'est produite lors de l'investissement"
      });
    } finally {
      setIsInvesting(false);
    }
  };

  return {
    isInvesting,
    investmentAmount,
    setInvestmentAmount,
    investmentSuccess,
    error,
    confirmInvestment
  };
}

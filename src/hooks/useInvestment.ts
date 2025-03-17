import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

interface Investment {
  id: string;
  amount: number;
  status: string;
  yield_rate: number;
  investment_date: string;
  projects: {
    id: string;
    name: string;
    description: string;
    status: string;
    yield: number;
    duration_months: number;
    min_investment: number;
    max_investment: number;
    image_url: string;
  };
}

export function useInvestment() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get ongoing investments
  const getOngoingInvestments = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Vous devez être connecté pour voir vos investissements");
        return [];
      }
      
      // Get active investments with project details
      const { data, error } = await supabase
        .from('investments')
        .select(`
          id,
          amount,
          status,
          yield_rate,
          investment_date,
          projects:project_id (
            id, 
            name,
            description,
            status,
            yield,
            duration_months,
            min_investment,
            max_investment,
            image_url
          )
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active');
        
      if (error) {
        console.error("Error fetching investments:", error);
        setError("Impossible de récupérer vos investissements");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Investment fetch error:", error);
      setError("Une erreur est survenue");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Invest in a project
  const investInProject = async (projectId: string, amount: number) => {
    try {
      setIsInvesting(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour investir");
        return false;
      }
      
      // Get user wallet balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching wallet balance:", profileError);
        toast.error("Impossible de vérifier votre solde");
        return false;
      }
      
      // Check if user has enough balance
      if (!profile || profile.wallet_balance < amount) {
        toast.error("Solde insuffisant pour cet investissement");
        return false;
      }
      
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('name, yield')
        .eq('id', projectId)
        .single();
        
      if (projectError) {
        console.error("Error fetching project:", projectError);
        toast.error("Impossible de récupérer les détails du projet");
        return false;
      }
      
      // Create investment record
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: session.user.id,
          project_id: projectId,
          amount: amount,
          yield_rate: project.yield,
          status: 'active'
        });
        
      if (investmentError) {
        console.error("Error creating investment:", investmentError);
        toast.error("Erreur lors de la création de l'investissement");
        return false;
      }
      
      // Deduct amount from wallet
      const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
        user_id: session.user.id,
        increment_amount: -amount
      });
      
      if (walletError) {
        console.error("Error updating wallet balance:", walletError);
        toast.error("Erreur lors de la mise à jour du solde");
        // Rollback investment record
        return false;
      }
      
      // Update investment stats in profile
      const { error: updateError } = await supabase.rpc('update_user_profile_investment', {
        user_id: session.user.id,
        investment_amount: amount
      });
      
      if (updateError) {
        console.error("Error updating profile stats:", updateError);
        // Non-critical error, continue
      }
      
      // Create notification
      notificationService.createNotification({
        type: 'investment',
        title: 'Investissement confirmé',
        message: `Votre investissement de ${amount}€ dans ${project.name} a été confirmé.`
      });
      
      toast.success("Investissement réussi");
      return true;
    } catch (error) {
      console.error("Investment error:", error);
      toast.error("Une erreur est survenue");
      return false;
    } finally {
      setIsInvesting(false);
    }
  };

  return {
    getOngoingInvestments,
    investInProject,
    isLoading,
    isInvesting,
    error
  };
}

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project } from "@/types/project";

export const investmentService = {
  async createInvestment(projectId: string, amount: number, duration: number): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        return { success: false, error: "Vous devez être connecté pour investir" };
      }
      
      // Fetch the project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        console.error("Error fetching project:", projectError);
        return { success: false, error: "Projet non trouvé" };
      }
      
      // Validate amount
      if (amount < project.min_investment) {
        return { success: false, error: `Le montant minimum est de ${project.min_investment}€` };
      }
      
      // Check if user has enough balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return { success: false, error: "Erreur lors de la vérification du solde" };
      }
      
      if (profile.wallet_balance < amount) {
        return { success: false, error: "Solde insuffisant" };
      }
      
      // Create the investment
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .insert({
          project_id: projectId,
          user_id: session.session.user.id,
          amount: amount,
          duration: duration,
          yield_rate: project.yield,
          status: 'active',
        })
        .select()
        .single();
      
      if (investmentError) {
        console.error("Error creating investment:", investmentError);
        return { success: false, error: "Erreur lors de la création de l'investissement" };
      }
      
      // Deduct amount from wallet balance
      const { error: updateError } = await supabase.rpc('decrement_wallet_balance', {
        user_id: session.session.user.id,
        decrement_amount: amount
      });
      
      if (updateError) {
        console.error("Error updating wallet balance:", updateError);
        return { success: false, error: "Erreur lors de la mise à jour du solde" };
      }
      
      // Create a wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: session.session.user.id,
          amount: amount,
          type: 'investment',
          description: `Investissement dans ${project.name}`,
          status: 'completed'
        });
      
      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        // Not critical, don't return error
      }
      
      // Update user profile investment stats
      const { error: profileUpdateError } = await supabase.rpc('update_user_profile_investment', {
        user_id: session.session.user.id,
        investment_amount: amount
      });
      
      if (profileUpdateError) {
        console.error("Error updating profile investment stats:", profileUpdateError);
        // Not critical, don't return error
      }
      
      // Process referral rewards if this is the user's first investment
      try {
        const { data: result, error } = await supabase.functions.invoke(
          'process-referral-rewards',
          {
            body: { 
              user_id: session.session.user.id,
              investment_id: investment.id
            }
          }
        );
        
        if (error) {
          console.error("Error processing referral rewards:", error);
        } else if (result && result.processed) {
          console.log("Referral rewards processed successfully:", result);
        }
      } catch (error) {
        console.error("Exception processing referral rewards:", error);
      }
      
      toast.success("Investissement réussi !");
      return { success: true, id: investment.id };
    } catch (error: any) {
      console.error("Investment error:", error);
      toast.error("Erreur lors de la création de l'investissement");
      return { success: false, error: error.message || "Une erreur s'est produite" };
    }
  },
  
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        return null;
      }

      return data as Project;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  },

  async calculateYield(projectId: string, investmentAmount: number): Promise<number | null> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        console.error("Project not found");
        return null;
      }

      const yieldAmount = (investmentAmount * project.yield) / 100;
      return yieldAmount;
    } catch (error) {
      console.error("Error calculating yield:", error);
      return null;
    }
  },
};

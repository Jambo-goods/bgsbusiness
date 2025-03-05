
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PendingInvestment } from "@/types/investment";

export function useInvestmentConfirmation() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [pendingInvestment, setPendingInvestment] = useState<PendingInvestment | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [success, setSuccess] = useState(false);

  // Load investment data from localStorage
  useEffect(() => {
    // Get pending investment from localStorage
    const storedInvestment = localStorage.getItem("pendingInvestment");
    if (storedInvestment) {
      const investment = JSON.parse(storedInvestment);
      if (investment.projectId === projectId) {
        setPendingInvestment(investment);
      } else {
        setError("Les détails de l'investissement ne correspondent pas au projet actuel");
      }
    } else {
      setError("Aucun investissement en attente trouvé");
    }
    setLoading(false);
  }, [projectId]);

  // Handle investment confirmation
  const handleConfirmInvestment = async () => {
    if (!pendingInvestment) return;
    
    setConfirming(true);
    try {
      // Step 1: Verify authentication
      setProcessingStep(1);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        return;
      }

      // Calculate end date
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + pendingInvestment.duration);

      // Step 2: Create the investment record
      setProcessingStep(2);
      const { error: investmentError } = await supabase.from('investments').insert({
        user_id: user.id,
        project_id: pendingInvestment.projectId,
        amount: pendingInvestment.amount,
        yield_rate: pendingInvestment.yield,
        duration: pendingInvestment.duration,
        end_date: endDate.toISOString(),
        date: new Date().toISOString()
      });
      
      if (investmentError) {
        console.error("Erreur lors de la création de l'investissement:", investmentError);
        toast.error("Impossible de créer l'investissement");
        return;
      }

      // Step 3: Create transaction record
      setProcessingStep(3);
      const { error: transactionError } = await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: -pendingInvestment.amount,
        type: 'investment',
        description: `Investissement dans ${pendingInvestment.projectName}`
      });
      
      if (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError);
        toast.error("Impossible de créer la transaction");
        return;
      }

      // Step 4: Update wallet balance
      setProcessingStep(4);
      const { error: balanceError } = await supabase.rpc('increment_wallet_balance', {
        user_id: user.id,
        increment_amount: -pendingInvestment.amount
      });
      
      if (balanceError) {
        console.error("Erreur lors de la mise à jour du solde:", balanceError);
        toast.error("Impossible de mettre à jour votre solde");
        return;
      }

      // Step 5: Update user profile stats
      setProcessingStep(5);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count')
        .eq('id', user.id)
        .single();
      
      if (!profileError && profileData) {
        const { data: existingInvestments } = await supabase
          .from('investments')
          .select('id')
          .eq('user_id', user.id)
          .eq('project_id', pendingInvestment.projectId);

        const newTotal = (profileData.investment_total || 0) + pendingInvestment.amount;
        let newCount = profileData.projects_count || 0;
        
        if (existingInvestments && existingInvestments.length <= 1) {
          newCount += 1;
        }

        await supabase.from('profiles').update({
          investment_total: newTotal,
          projects_count: newCount
        }).eq('id', user.id);
      }

      // Store recent investment details for dashboard display
      localStorage.setItem("recentInvestment", JSON.stringify({
        projectId: pendingInvestment.projectId,
        amount: pendingInvestment.amount,
        duration: pendingInvestment.duration,
        yield: pendingInvestment.yield,
        projectName: pendingInvestment.projectName,
        timestamp: new Date().toISOString()
      }));

      // Clear the pending investment
      localStorage.removeItem("pendingInvestment");
      
      // Display success message and show success state
      toast.success("Investissement réalisé avec succès !");
      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la confirmation de l'investissement:", error);
      toast.error("Une erreur est survenue lors de la confirmation de l'investissement");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    navigate(`/project/${projectId}`);
  };

  return {
    pendingInvestment,
    loading,
    confirming,
    error,
    processingStep,
    success,
    handleConfirmInvestment,
    handleCancel
  };
}

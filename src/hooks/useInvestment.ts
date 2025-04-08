
import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currencyUtils';

export const useInvestment = (project: Project, investorCount: number) => {
  // Extract possible durations from project, fallback to default if not available
  const projectDurations = project.possible_durations?.length 
    ? project.possible_durations 
    : [6, 12, 24, 36];
    
  const [investmentAmount, setInvestmentAmount] = useState(project.min_investment || 500);
  const [selectedDuration, setSelectedDuration] = useState(projectDurations[0]); // Use first duration as default
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  
  const minInvestment = project.min_investment || 500;
  const maxInvestment = project.maxInvestment || 10000;
  const yieldRate = project.yield || 8;
  
  // Default durations if project doesn't have specific ones
  const durations = projectDurations;
  
  // Calculate returns
  const monthlyReturn = (investmentAmount * yieldRate) / 100;
  const totalReturn = monthlyReturn * selectedDuration;
  
  // Fetch user balance
  useEffect(() => {
    const fetchUserBalance = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        const { data } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', session.session.user.id)
          .single();
          
        if (data) {
          setUserBalance(data.wallet_balance || 0);
        }
      }
    };
    
    fetchUserBalance();
  }, []);
  
  const handleInvest = () => {
    if (investmentAmount > userBalance) {
      toast.error("Solde insuffisant", { 
        description: "Vous n'avez pas assez de fonds dans votre portefeuille."
      });
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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Non connecté", { description: "Vous devez être connecté pour investir." });
        setIsProcessing(false);
        return;
      }
      
      const userId = session.session.user.id;
      
      // Create investment record
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: project.id,
          amount: investmentAmount,
          duration: selectedDuration,
          yield_rate: yieldRate,
          status: 'active'
        })
        .select()
        .single();
        
      if (investmentError) {
        throw investmentError;
      }
      
      // Update user wallet balance
      const { error: walletError } = await supabase.rpc(
        'decrement_wallet_balance',
        { user_id: userId, decrement_amount: investmentAmount }
      );
      
      if (walletError) {
        throw walletError;
      }
      
      // Create wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: -investmentAmount,
          type: 'investment',
          description: `Investissement dans ${project.title || project.name}`
        });
        
      if (transactionError) {
        throw transactionError;
      }
      
      toast.success("Investissement réussi", {
        description: `Vous avez investi ${formatCurrency(investmentAmount)} dans ce projet.`
      });
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = '/dashboard/investments';
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'investissement:', error);
      toast.error("Erreur", { 
        description: "Une erreur s'est produite lors de l'investissement. Veuillez réessayer."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    investmentAmount,
    setInvestmentAmount,
    selectedDuration,
    setSelectedDuration,
    showConfirmation,
    isProcessing,
    durations,
    totalReturn,
    monthlyReturn,
    minInvestment,
    maxInvestment,
    handleInvest,
    cancelInvestment,
    confirmInvestment
  };
};

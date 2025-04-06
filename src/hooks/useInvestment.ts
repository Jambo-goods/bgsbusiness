import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from '@/services/notifications';
import { useWalletBalance } from '@/hooks/useWalletBalance';

interface UseInvestmentReturn {
  investmentAmount: number;
  setInvestmentAmount: (amount: number) => void;
  showConfirmation: boolean;
  isProcessing: boolean;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  totalReturn: number;
  monthlyReturn: number;
  minInvestment: number;
  maxInvestment: number;
  durations: number[];
  handleInvest: () => void;
  cancelInvestment: () => void;
  confirmInvestment: () => void;
  investmentData: any | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useInvestment = (project: Project, investorCount: number): UseInvestmentReturn => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(project.min_investment || 500);
  const [selectedDuration, setSelectedDuration] = useState<number>(12);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const { walletBalance, refreshBalance } = useWalletBalance();
  
  const [investmentData, setInvestmentData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const minInvestment = project.min_investment || 500;
  const maxInvestment = project.maxInvestment || 10000;
  const projectYield = project.yield || 0.08;
  
  const durations = project.possibleDurations || [6, 12, 24, 36];
  
  const totalReturn = investmentAmount * (projectYield / 12) * selectedDuration;
  const monthlyReturn = totalReturn / selectedDuration;

  useEffect(() => {
    if (!project.id) return;

    const fetchInvestmentData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const mockData = {
          totalInvested: Math.round(project.price * 0.7),
          investorsCount: investorCount,
          investmentTarget: project.price || 100000,
          investmentProgress: project.fundingProgress || 0.7,
          status: project.status || 'active',
          startDate: project.startDate || new Date().toISOString(),
          endDate: project.endDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        setInvestmentData(mockData);
      } catch (err: any) {
        console.error("Error fetching investment data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestmentData();
  }, [project.id, investorCount, project.price, project.fundingProgress, project.status, project.startDate, project.endDate]);

  const handleInvest = () => {
    if (investmentAmount < minInvestment) {
      toast.error("Montant trop faible", {
        description: `L'investissement minimum est de ${minInvestment}€`
      });
      return;
    }
    
    if (investmentAmount > maxInvestment) {
      toast.error("Montant trop élevé", {
        description: `L'investissement maximum est de ${maxInvestment}€`
      });
      return;
    }
    
    if (walletBalance < investmentAmount) {
      toast.error("Solde insuffisant", {
        description: `Votre solde disponible est de ${walletBalance}€, vous ne pouvez pas investir ${investmentAmount}€`
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Utilisateur non connecté", {
          description: "Veuillez vous connecter pour investir."
        });
        setIsProcessing(false);
        return;
      }
      
      await refreshBalance(false);
      
      if (walletBalance < investmentAmount) {
        toast.error("Solde insuffisant", {
          description: `Votre solde actuel est de ${walletBalance}€, vous ne pouvez pas investir ${investmentAmount}€`
        });
        setIsProcessing(false);
        return;
      }
      
      const { data: investmentData, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: project.id,
          amount: investmentAmount,
          duration: selectedDuration,
          yield_rate: project.yield,
          status: 'active',
          date: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (investmentError) {
        console.error("Error recording investment:", investmentError);
        throw investmentError;
      }
      
      const { error: walletError } = await supabase.rpc(
        'decrement_wallet_balance',
        { 
          user_id: user.id, 
          decrement_amount: investmentAmount 
        }
      );
      
      if (walletError) {
        console.error("Error updating wallet balance:", walletError);
        throw walletError;
      }
      
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          amount: investmentAmount,
          type: 'investment',
          description: `Investissement dans ${project.name}`,
          status: 'completed'
        });
        
      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
        throw transactionError;
      }
      
      await notificationService.investmentConfirmed(project.name || "Projet", investmentAmount);
      
      const { error: profileError } = await supabase.rpc(
        'update_user_profile_investment',
        {
          user_id: user.id,
          investment_amount: investmentAmount
        }
      );
      
      if (profileError) {
        console.error("Error updating profile statistics:", profileError);
        throw profileError;
      }
      
      const recentInvestment = {
        projectId: project.id,
        amount: investmentAmount,
        date: new Date().toISOString()
      };
      localStorage.setItem("recentInvestment", JSON.stringify(recentInvestment));
      
      refreshBalance(false);
      
      toast.success("Investissement effectué", {
        description: `Votre investissement de ${investmentAmount}€ a été enregistré.`
      });
      
      setShowConfirmation(false);
      
    } catch (err) {
      console.error("Error processing investment:", err);
      toast.error("Erreur", {
        description: "Une erreur s'est produite lors de l'investissement."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const refreshData = () => {
    if (!project.id) return;
    
    toast.info("Actualisation des données...");
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Données actualisées");
    }, 1000);
  };

  return {
    investmentAmount,
    setInvestmentAmount,
    showConfirmation,
    isProcessing,
    selectedDuration,
    setSelectedDuration,
    totalReturn,
    monthlyReturn,
    minInvestment,
    maxInvestment,
    durations,
    handleInvest,
    cancelInvestment,
    confirmInvestment,
    investmentData,
    isLoading,
    error,
    refreshData
  };
};

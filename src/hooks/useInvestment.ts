
import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from '@/services/notifications';

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
  // Investment amount state
  const [investmentAmount, setInvestmentAmount] = useState<number>(project.minInvestment || 500);
  const [selectedDuration, setSelectedDuration] = useState<number>(12); // Default to 12 months
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Fetch related state
  const [investmentData, setInvestmentData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate derived data
  const minInvestment = project.minInvestment || 500;
  const maxInvestment = project.maxInvestment || 10000;
  const projectYield = project.yield || 0.08; // Default to 8%
  
  // Default durations if not provided
  const durations = project.possibleDurations || [6, 12, 24, 36];
  
  // Calculate returns
  const totalReturn = investmentAmount * (projectYield / 12) * selectedDuration;
  const monthlyReturn = totalReturn / selectedDuration;

  useEffect(() => {
    if (!project.id) return;

    const fetchInvestmentData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app we would query actual data
        // This is a placeholder that simulates a database query
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

  // Handle user investment actions
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
    
    // Show confirmation
    setShowConfirmation(true);
  };
  
  const cancelInvestment = () => {
    setShowConfirmation(false);
  };
  
  const confirmInvestment = async () => {
    setIsProcessing(true);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Utilisateur non connecté", {
          description: "Veuillez vous connecter pour investir."
        });
        setIsProcessing(false);
        return;
      }
      
      // 1. Record the investment in the database
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
      
      // 2. Deduct the amount from the user's wallet balance
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
      
      // 3. Record the transaction in wallet_transactions
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
      
      // 4. Create a notification for the investment
      await notificationService.investmentConfirmed(investmentAmount, project.name);
      
      // 5. Update user's profile statistics
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
      
      // 6. Store investment in local storage to immediately display it
      // (as a backup in case realtime subscriptions are slow)
      const recentInvestment = {
        projectId: project.id,
        amount: investmentAmount,
        date: new Date().toISOString()
      };
      localStorage.setItem("recentInvestment", JSON.stringify(recentInvestment));
      
      // Show success message
      toast.success("Investissement effectué", {
        description: `Votre investissement de ${investmentAmount}€ a été enregistré.`
      });
      
      // Reset form
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
    
    // In a real app we would refresh the data from the database
    toast.info("Actualisation des données...");
    setIsLoading(true);
    
    // Simulate a delay
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

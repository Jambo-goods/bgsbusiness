
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notificationService } from '@/services/notifications';

interface UseInvestmentProps {
  projectId: string;
}

interface Investment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  min_investment: number;
  available_amount: number;
  yield_rate: number;
  risk_rating: number;
}

export default function useInvestment({ projectId }: UseInvestmentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [pendingInvestments, setPendingInvestments] = useState<Investment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  
  // Load project data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // Get project data
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (projectError) {
          throw new Error('Failed to load project data');
        }
        
        if (!projectData) {
          throw new Error('Project not found');
        }
        
        setProject(projectData);
        setAmount(projectData.min_investment || 100);
        
        // Get wallet balance
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', session.session.user.id)
            .single();
          
          if (profileError) {
            console.error('Failed to load wallet balance:', profileError);
          } else if (profileData) {
            setWalletBalance(profileData.wallet_balance || 0);
          }
          
          // Get pending investments
          const { data: investmentsData, error: investmentsError } = await supabase
            .from('investments')
            .select('*')
            .eq('user_id', session.session.user.id)
            .eq('project_id', projectId)
            .eq('status', 'pending');
          
          if (investmentsError) {
            console.error('Failed to load investments:', investmentsError);
          } else if (investmentsData) {
            setPendingInvestments(investmentsData);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [projectId]);
  
  const handleAmountChange = (value: number) => {
    if (!project) return;
    
    if (value < (project.min_investment || 0)) {
      value = project.min_investment || 100;
    }
    if (value > walletBalance) {
      value = walletBalance;
    }
    
    setAmount(value);
  };
  
  const submitInvestment = async () => {
    if (!project || isSubmitting) return;
    
    if (amount < (project.min_investment || 0)) {
      toast.error('Investissement insuffisant', {
        description: `L'investissement minimum est de ${project.min_investment}€`
      });
      return;
    }
    
    if (amount > walletBalance) {
      toast.error('Solde insuffisant', {
        description: 'Votre solde est insuffisant pour cet investissement'
      });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get user data
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Vous devez être connecté pour investir');
      }
      
      // Start a transaction by decrementing wallet balance
      const { data: walletData, error: walletError } = await supabase
        .rpc('decrement_wallet_balance', {
          user_id_param: session.session.user.id,
          amount_param: amount
        });
      
      if (walletError) {
        throw new Error('Solde insuffisant. Veuillez recharger votre portefeuille.');
      }
      
      // Create investment record
      const { data: investmentData, error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: session.session.user.id,
          project_id: projectId,
          amount: amount,
          status: 'pending',
          expected_yield: project.yield_rate || 0
        })
        .select()
        .single();
      
      if (investmentError) {
        // Rollback in case of error
        await supabase
          .rpc('increment_wallet_balance', {
            user_id_param: session.session.user.id,
            amount_param: amount
          });
          
        throw new Error('Erreur lors de la création de l\'investissement');
      }
      
      // Update project available amount (if applicable)
      if (project.available_amount !== null && project.available_amount > 0) {
        const newAvailableAmount = Math.max(0, project.available_amount - amount);
        await supabase
          .from('projects')
          .update({ available_amount: newAvailableAmount })
          .eq('id', projectId);
      }
      
      // Log transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: session.session.user.id,
          amount: amount,
          type: 'investment',
          description: `Investissement dans ${project.title}`,
          status: 'completed'
        });
      
      // Send notification
      try {
        await notificationService.investmentConfirmed(project.title, amount);
      } catch (notificationError) {
        console.error('Failed to send investment notification:', notificationError);
        // Non-blocking, continue with success
      }
      
      // Create a referral completed investment record
      try {
        const { data: referralData } = await supabase
          .rpc('add_referral_reward', {
            user_param: session.session.user.id,
            amount_param: amount
          });
          
        if (referralData) {
          console.log('Referral reward added:', referralData);
        }
      } catch (referralError) {
        console.error('Failed to process referral reward:', referralError);
        // Non-blocking, continue with success
      }
      
      setIsSuccessful(true);
      toast.success('Investissement réussi', {
        description: `Vous avez investi ${amount}€ dans ${project.title}`
      });
      
      // Refresh investments list
      const { data: updatedInvestments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('project_id', projectId)
        .eq('status', 'pending');
        
      if (updatedInvestments) {
        setPendingInvestments(updatedInvestments);
      }
      
      // Refresh wallet balance
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.session.user.id)
        .single();
        
      if (updatedProfile) {
        setWalletBalance(updatedProfile.wallet_balance || 0);
      }
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      toast.error('Erreur d\'investissement', {
        description: err instanceof Error ? err.message : 'Une erreur est survenue'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    project,
    isLoading,
    error,
    amount,
    setAmount: handleAmountChange,
    walletBalance,
    pendingInvestments,
    isSubmitting,
    isSuccessful,
    submitInvestment
  };
}

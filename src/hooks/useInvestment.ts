
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
  yield_rate: number;
  project_id: string;
  user_id: string;
  duration: number;
  end_date?: string;
  date?: string;
}

interface Project {
  id: string;
  title: string;
  name: string; // For compatibility, since some places use name and others use title
  min_investment: number;
  available_amount: number;
  yield_rate: number;
  yield: number; // For compatibility, some places use yield and others use yield_rate
  risk_rating: number;
  // Additional fields from the database
  category?: string;
  company_name?: string;
  created_at?: string;
  description?: string;
  duration?: string;
  end_date?: string;
  featured?: boolean;
  first_payment_delay_months?: number;
  funding_progress?: number;
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
        
        // Map database fields to our Project interface
        const mappedProject: Project = {
          ...projectData,
          title: projectData.name || projectData.title, // Ensure title is available
          name: projectData.name || projectData.title, // Ensure name is available
          yield_rate: projectData.yield_rate || projectData.yield || 0, // Use yield_rate or fallback to yield
          yield: projectData.yield || projectData.yield_rate || 0, // Use yield or fallback to yield_rate
          min_investment: projectData.min_investment || 100,
          available_amount: projectData.available_amount || 0,
          risk_rating: projectData.risk_rating || 0
        };
        
        setProject(mappedProject);
        setAmount(mappedProject.min_investment || 100);
        
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
            const mappedInvestments: Investment[] = investmentsData.map(inv => ({
              ...inv,
              created_at: inv.date || inv.created_at || new Date().toISOString()
            }));
            setPendingInvestments(mappedInvestments);
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
          user_id: session.session.user.id,
          decrement_amount: amount
        });
      
      if (walletError) {
        throw new Error('Solde insuffisant. Veuillez recharger votre portefeuille.');
      }
      
      // Create investment record
      const investmentData = {
        user_id: session.session.user.id,
        project_id: projectId,
        amount: amount,
        status: 'pending',
        yield_rate: project.yield_rate || project.yield || 0,
        duration: parseInt(project.duration || '0', 10) || 12 // Default to 12 months if not specified
      };
      
      const { data: newInvestment, error: investmentError } = await supabase
        .from('investments')
        .insert(investmentData)
        .select()
        .single();
      
      if (investmentError) {
        // Rollback in case of error
        await supabase
          .rpc('increment_wallet_balance', {
            user_id: session.session.user.id,
            increment_amount: amount
          });
          
        throw new Error('Erreur lors de la création de l\'investissement');
      }
      
      // Update project available amount (if applicable)
      if (project.available_amount !== null && project.available_amount > 0) {
        await supabase
          .from('projects')
          .update({ 
            available_amount: Math.max(0, project.available_amount - amount) 
          })
          .eq('id', projectId);
      }
      
      // Log transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: session.session.user.id,
          amount: amount,
          type: 'investment',
          description: `Investissement dans ${project.title || project.name}`,
          status: 'completed'
        });
      
      // Send notification
      try {
        await notificationService.investmentConfirmed(project.title || project.name, amount);
      } catch (notificationError) {
        console.error('Failed to send investment notification:', notificationError);
        // Non-blocking, continue with success
      }
      
      // Create a referral completed investment record
      try {
        const { data: referralData } = await supabase
          .rpc('add_referral_reward', {
            user_id_param: session.session.user.id,
            amount_param: amount,
            description_param: `Investment in ${project.title || project.name}`
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
        description: `Vous avez investi ${amount}€ dans ${project.title || project.name}`
      });
      
      // Refresh investments list
      const { data: updatedInvestments } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', session.session.user.id)
        .eq('project_id', projectId)
        .eq('status', 'pending');
        
      if (updatedInvestments) {
        const mappedInvestments: Investment[] = updatedInvestments.map(inv => ({
          ...inv,
          created_at: inv.date || inv.created_at || new Date().toISOString()
        }));
        setPendingInvestments(mappedInvestments);
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

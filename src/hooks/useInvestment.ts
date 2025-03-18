
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserSession } from '@/hooks/dashboard/useUserSession';
import { useToast } from '@/hooks/use-toast';

export interface Investment {
  id: string;
  amount: number;
  user_id: string;
  project_id: string;
  yield_rate: number;
  duration: number;
  status: string;
  date: string;
  end_date: string;
  created_at?: string; // Make created_at optional
}

export const useInvestment = () => {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const { userId } = useUserSession();
  const { toast } = useToast();

  useEffect(() => {
    if (userId && projectId) {
      fetchInvestment();
    } else {
      setIsLoading(false);
    }
  }, [userId, projectId]);

  const fetchInvestment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {  // No rows returned
          setInvestment(null);
        } else {
          console.error('Error fetching investment:', error);
          setError('Une erreur est survenue lors de la récupération de votre investissement.');
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de récupérer les détails de votre investissement."
          });
        }
      } else if (data) {
        // Ensure the data has all required fields
        const investmentData: Investment = {
          id: data.id,
          amount: data.amount,
          user_id: data.user_id,
          project_id: data.project_id,
          yield_rate: data.yield_rate,
          duration: data.duration,
          status: data.status,
          date: data.date || new Date().toISOString(),
          end_date: data.end_date || '',
          created_at: data.date || new Date().toISOString() // Use date as created_at if needed
        };
        setInvestment(investmentData);
      }
    } catch (err) {
      console.error('Error in fetchInvestment:', err);
      setError('Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    investment,
    isLoading,
    error,
    refetch: fetchInvestment
  };
};

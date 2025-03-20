import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvestmentData {
  totalInvested: number;
  investorsCount: number;
  investmentTarget: number;
  investmentProgress: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface UseInvestmentReturn {
  investmentData: InvestmentData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useInvestment = (projectId: string, userId: string | null): UseInvestmentReturn => {
  const [investmentData, setInvestmentData] = useState<InvestmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchInvestmentData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('total_invested_amount, investors_count, investment_target, investment_progress, status, start_date, end_date')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error("Error fetching investment data:", error);
          setError(error.message);
        } else {
          setInvestmentData({
            totalInvested: data.total_invested_amount,
            investorsCount: data.investors_count,
            investmentTarget: data.investment_target,
            investmentProgress: data.investment_progress,
            status: data.status,
            startDate: data.start_date,
            endDate: data.end_date
          });
        }
      } catch (err: any) {
        console.error("Unexpected error fetching investment data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestmentData();
  }, [projectId]);

  const refreshData = () => {
    toast.info("Actualisation des données d'investissement...");
    if (!projectId) return;

    const fetchInvestmentData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('total_invested_amount, investors_count, investment_target, investment_progress, status, start_date, end_date')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error("Error fetching investment data:", error);
          setError(error.message);
        } else {
          setInvestmentData({
            totalInvested: data.total_invested_amount,
            investorsCount: data.investors_count,
            investmentTarget: data.investment_target,
            investmentProgress: data.investment_progress,
            status: data.status,
            startDate: data.start_date,
            endDate: data.end_date
          });
        }
      } catch (err: any) {
        console.error("Unexpected error fetching investment data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestmentData();
  };

  return {
    investmentData,
    isLoading,
    error,
    refreshData
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBankTransferData = () => {
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Define the query based on the status filter
      let query = supabase
        .from('bank_transfers')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      // Apply status filter if not "all"
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format data by adding user_name from profiles
      const formattedData = (data || []).map(transfer => ({
        ...transfer,
        user_name: transfer.profiles ? 
          `${transfer.profiles.first_name || ''} ${transfer.profiles.last_name || ''}`.trim() || transfer.profiles.email : 
          'Utilisateur inconnu'
      }));
      
      setPendingTransfers(formattedData);
    } catch (error) {
      console.error('Error fetching bank transfers:', error);
      setIsError(true);
      toast.error('Erreur lors du chargement des virements bancaires');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and when status filter changes
  useEffect(() => {
    fetchTransfers();
  }, [statusFilter]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchTransfers();
    toast.success('Données actualisées');
  };

  return {
    pendingTransfers,
    isLoading,
    isError,
    statusFilter,
    setStatusFilter,
    refetch: fetchTransfers,
    handleManualRefresh
  };
};

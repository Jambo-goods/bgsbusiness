
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBankTransfersData = () => {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      const { data, error } = await supabase
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
      
      if (error) throw error;
      
      // Format data by adding user_name from profiles
      const formattedData = (data || []).map(transfer => ({
        ...transfer,
        user_name: transfer.profiles ? 
          `${transfer.profiles.first_name || ''} ${transfer.profiles.last_name || ''}`.trim() || transfer.profiles.email : 
          'Utilisateur inconnu'
      }));
      
      setTransfers(formattedData);
    } catch (error) {
      console.error('Error fetching bank transfers:', error);
      setIsError(true);
      toast.error('Erreur lors du chargement des virements bancaires');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  return {
    transfers,
    isLoading,
    isError,
    refetch: fetchTransfers
  };
};

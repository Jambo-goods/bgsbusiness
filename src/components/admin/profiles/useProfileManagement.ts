import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/components/admin/profiles/types';

export const useProfileManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState<string>('100');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all profiles
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Log the fetched data for debugging
      console.log('Fetched profiles data:', data);
      console.log('Number of profiles fetched:', data?.length);
      
      setProfiles(data || []);
      setTotalProfiles(count || 0);
      toast.success('Profils chargés avec succès');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des profils');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProfiles();
  };

  const handleAddFundsToAll = async () => {
    try {
      setIsProcessing(true);
      
      const amount = parseInt(amountToAdd, 10);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      const promises = profiles.map(async (profile) => {
        const { error } = await supabase.rpc('increment_wallet_balance', {
          user_id: profile.id,
          increment_amount: amount
        });
        
        if (error) {
          console.error(`Error adding funds to profile ${profile.id}:`, error);
          return false;
        }
        
        await supabase.from('wallet_transactions').insert({
          user_id: profile.id,
          amount: amount,
          type: 'deposit',
          status: 'completed',
          description: 'Ajout de fonds par administrateur (opération groupée)'
        });
        
        return true;
      });
      
      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      
      await supabase.from('admin_logs').insert({
        description: `Ajout de ${amount}€ à tous les profils (${successCount}/${profiles.length} réussis)`,
        action_type: 'wallet_management',
        amount: amount
      });
      
      toast.success(`${successCount} profils mis à jour avec succès!`);
      setIsAddFundsDialogOpen(false);
      
      fetchProfiles();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout des fonds');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (profile.first_name && profile.first_name.toLowerCase().includes(searchLower)) ||
      (profile.last_name && profile.last_name.toLowerCase().includes(searchLower)) ||
      (profile.email && profile.email.toLowerCase().includes(searchLower))
    );
  });

  return {
    profiles,
    isLoading,
    searchTerm,
    setSearchTerm,
    isRefreshing,
    totalProfiles,
    isAddFundsDialogOpen,
    setIsAddFundsDialogOpen,
    amountToAdd,
    setAmountToAdd,
    isProcessing,
    filteredProfiles,
    handleRefresh,
    handleAddFundsToAll
  };
};

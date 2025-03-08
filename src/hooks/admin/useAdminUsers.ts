
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/types/profile';

export function useAdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [totalWalletBalance, setTotalWalletBalance] = useState(0);

  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get all profiles without filtering by online status
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Add default online_status property to all profiles
      const profilesWithStatus: Profile[] = data?.map(profile => ({
        ...profile,
        online_status: 'offline' as const
      })) || [];
      
      setProfiles(profilesWithStatus);
      setTotalProfiles(profilesWithStatus.length);
      
      // Calculate total wallet balance
      const totalBalance = profilesWithStatus.reduce((sum, profile) => 
        sum + (profile.wallet_balance || 0), 0);
      setTotalWalletBalance(totalBalance);
      
      toast.success('Utilisateurs chargés avec succès');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

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
    totalProfiles,
    filteredProfiles,
    refreshProfiles: fetchProfiles,
    totalWalletBalance
  };
}

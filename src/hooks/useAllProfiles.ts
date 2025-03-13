
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
  investment_total: number | null;
  created_at: string | null;
};

export const useAllProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalProfiles, setTotalProfiles] = useState(0);

  useEffect(() => {
    console.log("AllProfiles component mounted");
    fetchProfiles();
    
    return () => {
      console.log("AllProfiles component unmounted");
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all profiles...");
      
      // Fetch all profiles from the database without filtering
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Profiles fetched successfully:', data);
      console.log('Total profiles count:', count);
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
    console.log("Manual refresh requested");
    setIsRefreshing(true);
    fetchProfiles();
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
    filteredProfiles,
    handleRefresh
  };
};

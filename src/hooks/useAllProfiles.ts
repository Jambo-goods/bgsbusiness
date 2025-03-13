
import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string | null;
  last_active_at: string | null;
  wallet_balance: number | null;
  investment_total: number | null;
  projects_count: number | null;
  phone: string | null;
  address: string | null;
}

export const useAllProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Error loading profiles');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
    
    // Set up auto-refresh every minute
    const intervalId = setInterval(() => {
      setIsRefreshing(true);
      fetchProfiles();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchProfiles]);
  
  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
    const email = (profile.email || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    
    return fullName.includes(term) || email.includes(term);
  });
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProfiles();
  };
  
  const totalProfiles = profiles.length;

  return { 
    profiles, 
    filteredProfiles, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    refreshProfiles: fetchProfiles,
    isRefreshing,
    totalProfiles,
    handleRefresh
  };
};

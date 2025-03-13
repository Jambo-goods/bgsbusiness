
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  last_active_at: string | null;  // Added to fix type error
  wallet_balance?: number | null;
  account_status?: 'active' | 'inactive' | 'suspended';
};

export const useAllProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      
      // Get all profiles
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Process profiles and determine account status
      const processedProfiles: Profile[] = data?.map(profile => {
        // Determine account status based on last activity
        let account_status: 'active' | 'inactive' | 'suspended' = 'inactive';
        
        if (profile.last_active_at) {
          const lastActive = new Date(profile.last_active_at);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 30) {
            account_status = 'active';
          }
        }
        
        return {
          ...profile,
          account_status
        };
      }) || [];
      
      setProfiles(processedProfiles);
      setTotalProfiles(count || 0);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
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
    totalProfiles,
    filteredProfiles,
    refreshProfiles: fetchProfiles
  };
};

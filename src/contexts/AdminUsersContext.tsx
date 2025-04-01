
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string | null;
  last_active_at?: string | null;
  wallet_balance?: number | null;
  projects_count?: number | null;
  investment_total?: number | null;
  account_status?: 'active' | 'inactive' | 'suspended';
};

interface AdminUsersContextType {
  profiles: Profile[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalProfiles: number;
  filteredProfiles: Profile[];
  refreshProfiles: () => Promise<void>;
}

const AdminUsersContext = createContext<AdminUsersContextType | undefined>(undefined);

export const AdminUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched profiles data:', data?.length || 0);

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
      
      console.log('Processed profiles:', processedProfiles.length);
      setProfiles(processedProfiles);
      setTotalProfiles(processedProfiles.length);
      setIsLoading(false); // Make sure to set loading to false here
      toast.success('Utilisateurs chargés avec succès');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
      setIsLoading(false); // Make sure to set loading to false here too
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

  const refreshProfiles = async () => {
    await fetchProfiles();
  };

  return (
    <AdminUsersContext.Provider 
      value={{ 
        profiles, 
        isLoading, 
        searchTerm, 
        setSearchTerm, 
        totalProfiles, 
        filteredProfiles,
        refreshProfiles
      }}
    >
      {children}
    </AdminUsersContext.Provider>
  );
};

export const useAdminUsers = () => {
  const context = useContext(AdminUsersContext);
  if (context === undefined) {
    throw new Error('useAdminUsers must be used within an AdminUsersProvider');
  }
  return context;
};

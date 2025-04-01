
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '@/components/admin/profiles/types';

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
  const [error, setError] = useState<Error | null>(null);
  
  // Debug logging function
  const logDebug = (message: string, data?: any) => {
    console.log(`[AdminUsers] ${message}`, data || '');
  };

  useEffect(() => {
    logDebug('Provider mounted, fetching profiles');
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      logDebug('Starting to fetch profiles');
      setIsLoading(true);
      setError(null);
      
      // Get all profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logDebug('Error fetching profiles', error);
        throw error;
      }

      logDebug('Fetched profiles count', data?.length || 0);
      if (data && data.length > 0) {
        logDebug('First profile sample', data[0]);
      } else {
        logDebug('No profiles found in database');
      }

      // Process profiles and determine account status
      const processedProfiles: Profile[] = data?.map(profile => {
        // Determine account status based on last activity
        let online_status: 'online' | 'offline' = 'offline';
        
        if (profile.last_active_at) {
          const lastActive = new Date(profile.last_active_at);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
          
          if (diffMinutes < 15) {
            online_status = 'online';
          }
        }
        
        return {
          ...profile,
          online_status,
          wallet_balance: profile.wallet_balance || 0,
          projects_count: profile.projects_count || 0,
          investment_total: profile.investment_total || 0
        };
      }) || [];
      
      logDebug('Setting processed profiles', { count: processedProfiles.length });
      setProfiles(processedProfiles);
      setTotalProfiles(processedProfiles.length);
      
      if (processedProfiles.length > 0) {
        toast.success(`${processedProfiles.length} utilisateurs chargés avec succès`);
      } else {
        toast.info('Aucun utilisateur trouvé dans la base de données');
      }
    } catch (err) {
      const error = err as Error;
      logDebug('Error in fetchProfiles', error);
      setError(error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      logDebug('Setting isLoading to false');
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

  const refreshProfiles = async () => {
    logDebug('Refreshing profiles');
    await fetchProfiles();
  };

  logDebug('Rendering context provider', { 
    profilesCount: profiles.length, 
    filteredCount: filteredProfiles.length,
    isLoading 
  });

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

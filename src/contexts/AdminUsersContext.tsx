
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from '@/hooks/admin/types';

interface AdminUsersContextType {
  profiles: UserProfile[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalProfiles: number;
  filteredProfiles: UserProfile[];
  refreshProfiles: () => Promise<void>;
  onlineUserCount: number;
  addFundsToUser: (userId: string, amount: number) => Promise<boolean>;
}

const AdminUsersContext = createContext<AdminUsersContextType | undefined>(undefined);

export const AdminUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [onlineUserCount, setOnlineUserCount] = useState(0);

  useEffect(() => {
    fetchProfiles();
    const interval = setInterval(refreshOnlineStatus, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const determineUserStatus = (profile: any): 'active' | 'inactive' | 'suspended' => {
    // If user has been active in the last 30 days, they're considered active
    if (profile.last_active_at) {
      const lastActive = new Date(profile.last_active_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return 'active';
      } else if (diffDays < 90) {
        return 'inactive';
      }
      return 'suspended';
    }
    
    // If user has never been active but created their account in last 30 days
    if (profile.created_at) {
      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return 'active';
      } else if (diffDays < 90) {
        return 'inactive';
      }
    }
    
    return 'inactive';
  };
  
  const determineOnlineStatus = (profile: any): 'online' | 'offline' => {
    // Consider user online if they've been active in the last 15 minutes
    if (profile.last_active_at) {
      const lastActive = new Date(profile.last_active_at);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
      
      if (diffMinutes < 15) {
        return 'online';
      }
    }
    
    return 'offline';
  };

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

      // Process profiles and determine account status
      const processedProfiles: UserProfile[] = data?.map(profile => {
        const accountStatus = determineUserStatus(profile);
        const onlineStatus = determineOnlineStatus(profile);
        
        return {
          ...profile,
          account_status: accountStatus,
          online_status: onlineStatus
        };
      }) || [];
      
      const onlineUsers = processedProfiles.filter(profile => profile.online_status === 'online');
      setOnlineUserCount(onlineUsers.length);
      
      setProfiles(processedProfiles);
      setTotalProfiles(processedProfiles.length);
      toast.success('Utilisateurs chargés avec succès');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOnlineStatus = async () => {
    // Only update online status without full reload
    const updatedProfiles = profiles.map(profile => ({
      ...profile,
      online_status: determineOnlineStatus(profile)
    }));
    
    const onlineUsers = updatedProfiles.filter(profile => profile.online_status === 'online');
    setOnlineUserCount(onlineUsers.length);
    
    setProfiles(updatedProfiles);
  };

  const addFundsToUser = async (userId: string, amount: number): Promise<boolean> => {
    try {
      // Update wallet balance using RPC function
      const { error: rpcError } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: amount
      });
      
      if (rpcError) throw rpcError;
      
      // Create transaction record
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          status: 'completed',
          description: 'Ajout de fonds par administrateur'
        });
      
      if (txError) throw txError;
      
      // Log admin action
      await supabase
        .from('admin_logs')
        .insert({
          description: `Ajout de ${amount}€ au portefeuille utilisateur (ID: ${userId})`,
          action_type: 'wallet_management',
          target_user_id: userId,
          amount: amount
        });
      
      // Refresh profiles to show updated balance
      await fetchProfiles();
      
      toast.success(`${amount}€ ajoutés avec succès au portefeuille`);
      return true;
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Erreur lors de l\'ajout des fonds');
      return false;
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
        refreshProfiles,
        onlineUserCount,
        addFundsToUser
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

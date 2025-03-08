
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  last_active_at?: string | null;
  wallet_balance?: number;
  online_status: 'online' | 'offline';
};

interface AdminUsersContextType {
  profiles: Profile[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalProfiles: number;
  filteredProfiles: Profile[];
  refreshProfiles: () => Promise<void>;
  addFundsToUser: (userId: string, amount: number) => Promise<void>;
  withdrawFundsFromUser: (userId: string, amount: number) => Promise<void>;
  totalWalletBalance: number;
}

const AdminUsersContext = createContext<AdminUsersContextType | undefined>(undefined);

export const AdminUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [totalWalletBalance, setTotalWalletBalance] = useState(0);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
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
  };

  const addFundsToUser = async (userId: string, amount: number) => {
    try {
      // Create a transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          description: 'Dépôt de fonds par l\'administrateur'
        });

      if (transactionError) throw transactionError;

      // Update user wallet balance
      const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: amount
      });

      if (walletError) throw walletError;

      // Log admin action - FIX: Use "wallet_management" instead of "deposit"
      await supabase.from('admin_logs').insert({
        action_type: 'wallet_management',
        description: `Dépôt de ${amount}€ sur le compte utilisateur`,
        target_user_id: userId,
        amount: amount
      });

      toast.success(`${amount}€ ajoutés au compte utilisateur`);
      await fetchProfiles(); // Refresh the profiles data
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Erreur lors de l\'ajout de fonds');
    }
  };

  const withdrawFundsFromUser = async (userId: string, amount: number) => {
    try {
      // Check if user has enough balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if ((userData.wallet_balance || 0) < amount) {
        toast.error('Solde insuffisant pour effectuer ce retrait');
        return;
      }

      // Create a transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'withdrawal',
          description: 'Retrait de fonds par l\'administrateur'
        });

      if (transactionError) throw transactionError;

      // Update user wallet balance (negative amount for withdrawal)
      const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: -amount
      });

      if (walletError) throw walletError;

      // Log admin action - FIX: Use "wallet_management" instead of "withdrawal"
      await supabase.from('admin_logs').insert({
        action_type: 'wallet_management',
        description: `Retrait de ${amount}€ du compte utilisateur`,
        target_user_id: userId,
        amount: amount
      });

      toast.success(`${amount}€ retirés du compte utilisateur`);
      await fetchProfiles(); // Refresh the profiles data
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Erreur lors du retrait de fonds');
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
        addFundsToUser,
        withdrawFundsFromUser,
        totalWalletBalance
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

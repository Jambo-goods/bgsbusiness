
import React, { createContext, useContext } from 'react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { addFundsToUser, withdrawFundsFromUser } from '@/utils/admin/walletOperations';
import { Profile } from '@/types/profile';

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
  const {
    profiles,
    isLoading,
    searchTerm,
    setSearchTerm,
    totalProfiles,
    filteredProfiles,
    refreshProfiles,
    totalWalletBalance
  } = useAdminUsers();

  // Wrapper functions to maintain API compatibility
  const handleAddFundsToUser = async (userId: string, amount: number) => {
    const success = await addFundsToUser(userId, amount);
    if (success) {
      await refreshProfiles();
    }
  };

  const handleWithdrawFundsFromUser = async (userId: string, amount: number) => {
    const success = await withdrawFundsFromUser(userId, amount);
    if (success) {
      await refreshProfiles();
    }
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
        addFundsToUser: handleAddFundsToUser,
        withdrawFundsFromUser: handleWithdrawFundsFromUser,
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

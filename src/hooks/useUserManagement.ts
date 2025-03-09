
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  wallet_balance: number | null;
  investment_total: number | null;
  created_at: string | null;
}

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({
    field: 'created_at',
    direction: 'desc'
  });

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addFundsToUser = async (userId: string, amount: number) => {
    try {
      // Increment the user's wallet balance
      const { error } = await supabase.rpc('increment_wallet_balance', {
        user_id: userId,
        increment_amount: amount
      });
      
      if (error) throw error;
      
      // Add a record to wallet_transactions
      await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          description: 'Dépôt administratif',
          status: 'completed'
        });
      
      // Update the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, wallet_balance: (user.wallet_balance || 0) + amount } 
            : user
        )
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding funds:', error);
      toast.error('Erreur lors de l\'ajout de fonds');
      return { success: false, error: error.message };
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  // Sort users based on sortConfig
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortConfig.field as keyof User];
    const bValue = b[sortConfig.field as keyof User];
    
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const handleSort = (field: string) => {
    setSortConfig(prevConfig => ({
      field,
      direction: 
        prevConfig.field === field && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  return {
    users: sortedUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    fetchUsers,
    addFundsToUser
  };
}

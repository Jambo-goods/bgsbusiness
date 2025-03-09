
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUsersList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    
    // Set up real-time subscription
    const usersSubscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        // Refresh the data when changes occur
        fetchUsers();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(usersSubscription);
    };
  }, [fetchUsers]);

  const handleSaveEdit = async (userId: string, field: string, value: string) => {
    try {
      let updates: Record<string, any> = {};
      
      // Handle special case for name (first_name + last_name)
      if (field === 'name') {
        updates = {
          first_name: editValues.first_name,
          last_name: editValues.last_name
        };
      } else {
        // For other fields, simply update the single field
        updates[field] = field === 'wallet_balance' ? parseInt(value) : value;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      
      // Clear editing state
      setEditingUserId(null);
      setEditValues({});
      
      // Refresh users to show updated data
      await fetchUsers();
      
      toast({
        title: "Success",
        description: "User information updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user information",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.first_name?.toLowerCase().includes(searchLower) || false) ||
      (user.last_name?.toLowerCase().includes(searchLower) || false) ||
      (user.email?.toLowerCase().includes(searchLower) || false)
    );
  });

  return {
    users: filteredUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    fetchUsers,
    editingUserId,
    setEditingUserId,
    editValues,
    setEditValues,
    handleSaveEdit
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wallet_balance: number | null;
  projects_count: number | null;
  investment_total: number | null;
  created_at: string | null;
  address: string | null;
};

export const useUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<User>>({});

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all users...");
      
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
        return;
      }

      console.log('Users fetched successfully:', data);
      setUsers(data || []);
      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchUsers();
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(user => user.id === userId);
    if (userToEdit) {
      setEditingUser(userId);
      setEditedValues({
        first_name: userToEdit.first_name,
        last_name: userToEdit.last_name,
        email: userToEdit.email,
        phone: userToEdit.phone,
        address: userToEdit.address
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditedValues({});
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      setIsRefreshing(true);
      const { error } = await supabase
        .from('profiles')
        .update(editedValues)
        .eq('id', editingUser);

      if (error) {
        console.error('Error updating user:', error);
        toast.error('Erreur lors de la mise à jour de l\'utilisateur');
        return;
      }

      toast.success('Utilisateur mis à jour avec succès');
      fetchUsers();
      setEditingUser(null);
      setEditedValues({});
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleChangeEditedValue = (field: string, value: string | number) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower))
    );
  });

  return {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    isRefreshing,
    totalUsers,
    filteredUsers,
    handleRefresh,
    editingUser,
    editedValues,
    handleEditUser,
    handleCancelEdit,
    handleSaveEdit,
    handleChangeEditedValue
  };
};

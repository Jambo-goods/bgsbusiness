
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from '../useAllProfiles';

export const useAllUsersData = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all users data...");
      
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Fetched profiles:", data);
      console.log("Total count:", count);
      
      setUsers(data || []);
      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    // Set up real-time listener for profile changes
    const channel = supabase
      .channel('table_db_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log('Profile data changed, refreshing...');
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  const refreshUsers = useCallback(async () => {
    console.log("Manually refreshing users...");
    await fetchUsers();
    toast.success('Liste des utilisateurs actualisée');
  }, [fetchUsers]);

  return { users, isLoading, totalUsers, refreshUsers };
};

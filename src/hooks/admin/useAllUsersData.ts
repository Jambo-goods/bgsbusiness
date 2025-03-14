
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

export const useAllUsersData = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw error;
      
      setUsers(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err);
      toast.error('Failed to load users', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Set up realtime subscription
    const usersSubscription = supabase
      .channel('admin_users_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          console.log('Users data changed, refreshing...');
          fetchUsers();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(usersSubscription);
    };
  }, []);

  // Provide both loading and isLoading for backward compatibility
  return { 
    users, 
    loading, 
    error, 
    fetchUsers,
    isLoading: loading,
    refreshUsers: fetchUsers,
    totalUsers: users.length
  };
};

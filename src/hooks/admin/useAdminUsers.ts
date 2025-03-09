
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
}

export function useAdminUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const fetchAdminUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');
      
      if (error) throw error;
      
      setAdminUsers(data || []);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.error("Erreur lors du chargement des administrateurs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeAdmin = useCallback(async (adminId: string) => {
    try {
      setIsLoading(true);
      
      // Delete the admin user from the database
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
      
      if (error) throw error;
      
      // Update the local state
      setAdminUsers(prevUsers => prevUsers.filter(user => user.id !== adminId));
      toast.success("Administrateur supprimé avec succès");
    } catch (error) {
      console.error("Error removing admin:", error);
      toast.error("Erreur lors de la suppression de l'administrateur");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    adminUsers,
    isLoading,
    fetchAdminUsers,
    removeAdmin
  };
}

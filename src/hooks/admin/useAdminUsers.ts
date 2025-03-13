
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  phone: string | null;
  wallet_balance: number | null;
}

export function useAdminUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const fetchAdminUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("useAdminUsers - Fetching all profiles from database...");
      
      // Fetch all users from the profiles table without restrictions
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at, phone, wallet_balance')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      
      console.log("useAdminUsers - Fetched profiles count:", data?.length || 0);
      console.log("useAdminUsers - First profile data:", data?.[0]);
      
      setAdminUsers(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeAdmin = useCallback(async (adminId: string) => {
    try {
      setIsLoading(true);
      
      // Note: This doesn't actually delete the profile, just removes it from the UI
      setAdminUsers(prevUsers => prevUsers.filter(user => user.id !== adminId));
      toast.success("Utilisateur supprimé de la liste");
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
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

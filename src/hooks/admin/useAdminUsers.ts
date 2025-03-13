
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
      
      // Récupérer tous les utilisateurs administrateurs avec les informations de profil
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          id,
          email,
          created_at,
          profiles!inner(first_name, last_name)
        `);
      
      if (error) throw error;
      
      // Transformer les données pour correspondre à l'interface AdminUser
      const formattedUsers: AdminUser[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.profiles?.first_name || null,
        last_name: user.profiles?.last_name || null,
        created_at: user.created_at
      }));
      
      setAdminUsers(formattedUsers);
      console.log("Admin users loaded:", formattedUsers);
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
      
      // Supprimer l'administrateur de la base de données
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
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

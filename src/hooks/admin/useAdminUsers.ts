
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/AdminContext';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

export const useAdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { adminUser } = useAdmin();

  const fetchAdminUsers = useCallback(async () => {
    if (!adminUser) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Set user data without trying to get additional details
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Erreur lors du chargement des administrateurs');
    } finally {
      setIsLoading(false);
    }
  }, [adminUser]);

  const addAdmin = useCallback(async (email: string) => {
    if (!adminUser) return;
    
    try {
      // Check if admin already exists
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email);
        
      if (!adminCheckError && existingAdmin && existingAdmin.length > 0) {
        toast.error('Cet utilisateur est déjà administrateur');
        return;
      }
      
      // This method doesn't exist in Supabase v2, commenting out
      /*
      // Get user from auth if they exist
      const { data: userResponse, error: userError } = await supabase.auth
        .admin.listUsers({ filter: `email.eq.${email}` });
        
      if (userError || !userResponse || userResponse.users.length === 0) {
        toast.error("Utilisateur non trouvé dans le système d'authentification");
        return;
      }
      
      const userId = userResponse.users[0].id;
      */
      
      toast.error("Fonctionnalité non disponible dans cette version");
      return;
      
      // Add to admin_users table
      /*
      const { error } = await supabase
        .from('admin_users')
        .insert([{ 
          id: userId,
          email: email,
          role: 'admin'
        }]);
        
      if (error) throw error;
      
      toast.success('Administrateur ajouté avec succès');
      fetchAdminUsers();
      */
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error("Erreur lors de l'ajout de l'administrateur");
    }
  }, [adminUser, fetchAdminUsers]);

  const removeAdmin = useCallback(async (adminId: string) => {
    if (!adminUser || adminUser.id === adminId) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
        
      if (error) throw error;
      
      toast.success('Administrateur supprimé avec succès');
      fetchAdminUsers();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error("Erreur lors de la suppression de l'administrateur");
    }
  }, [adminUser, fetchAdminUsers]);

  return { 
    adminUsers, 
    isLoading, 
    fetchAdminUsers, 
    addAdmin, 
    removeAdmin 
  };
};

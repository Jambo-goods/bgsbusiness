
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
      
      // Join with profiles table to get first_name and last_name if available
      const adminData = await Promise.all(
        (data || []).map(async (admin) => {
          // Try to get profile info from auth user
          const { data: authData } = await supabase.auth
            .admin.getUserById(admin.id);
            
          return {
            ...admin,
            first_name: authData?.user.user_metadata?.first_name || '',
            last_name: authData?.user.user_metadata?.last_name || '',
          };
        })
      );
      
      setAdminUsers(adminData);
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
      // Check if user exists in auth system
      const { data: existingUser, error: userError } = await supabase.auth
        .admin.getUserByEmail(email);
        
      if (userError) {
        toast.error("Utilisateur non trouvé dans le système d'authentification");
        return;
      }
      
      // Check if admin already exists
      const { data: existingAdmin, error: adminCheckError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email);
        
      if (!adminCheckError && existingAdmin && existingAdmin.length > 0) {
        toast.error('Cet utilisateur est déjà administrateur');
        return;
      }
      
      // Add to admin_users table
      const { error } = await supabase
        .from('admin_users')
        .insert([{ 
          id: existingUser.user.id,
          email: email,
          role: 'admin'
        }]);
        
      if (error) throw error;
      
      toast.success('Administrateur ajouté avec succès');
      fetchAdminUsers();
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

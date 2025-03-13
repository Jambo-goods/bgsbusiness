
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AdminLoginParams {
  email: string;
  password: string;
}

export const loginAdmin = async ({ email, password }: AdminLoginParams) => {
  try {
    // Check if this is the admin email and password (hardcoded for development)
    if (email === 'admin@example.com' && password === 'admin123') {
      // Create a mock admin user without checking Supabase Auth
      const admin: AdminUser = {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
      };

      // Store admin user in localStorage
      localStorage.setItem('adminUser', JSON.stringify(admin));
      
      return { success: true, admin };
    }
    
    // If not the admin credentials, return error
    return { 
      success: false, 
      error: "Identifiants invalides ou vous n'avez pas les droits d'administration" 
    };
  } catch (error) {
    console.error("Admin login error:", error);
    return { success: false, error: "Une erreur s'est produite lors de la connexion" };
  }
};

export const logoutAdmin = () => {
  // Clear admin user from localStorage
  localStorage.removeItem('adminUser');
  // Sign out from supabase
  supabase.auth.signOut();
};

export const getCurrentAdmin = (): AdminUser | null => {
  const adminUser = localStorage.getItem('adminUser');
  if (adminUser) {
    return JSON.parse(adminUser);
  }
  return null;
};

export const logAdminAction = async (
  adminId: string, 
  actionType: string, 
  description: string, 
  userId?: string | null,
  projectId?: string,
  amount?: number
) => {
  // We don't have admin_logs table yet, so commenting this out
  /*
  try {
    await supabase.from('admin_logs').insert({
      admin_id: adminId,
      action_type: actionType,
      description,
      user_id: userId,
      project_id: projectId,
      amount: amount
    });
  } catch (error) {
    console.error("Error logging admin action:", error);
  }
  */
};

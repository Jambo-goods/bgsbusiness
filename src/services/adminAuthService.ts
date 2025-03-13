
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
    // Check if the email exists in the admin_users table
    const { data: adminUser, error: adminCheckError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (adminCheckError || !adminUser) {
      return { 
        success: false, 
        error: "Identifiants invalides ou vous n'avez pas les droits d'administration" 
      };
    }

    // If the email exists in the admin_users table, attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Erreur lors de la connexion" };
    }

    // Create admin user object
    const admin: AdminUser = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      first_name: data.user.user_metadata?.first_name || "",
      last_name: data.user.user_metadata?.last_name || "",
    };

    // Store admin user in localStorage
    localStorage.setItem('adminUser', JSON.stringify(admin));

    // We don't have admin_logs table yet, so commenting this out
    // Log admin activity
    /*
    try {
      await supabase.from('admin_logs').insert({
        admin_id: admin.id,
        action_type: 'login',
        description: 'Admin login',
        user_id: null,
        project_id: null,
        amount: null
      });
    } catch (error) {
      console.error("Error logging admin action:", error);
    }
    */

    return { success: true, admin };
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

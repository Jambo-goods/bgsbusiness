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
    // First authenticate with Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Authentication error:", error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Erreur lors de la connexion" };
    }

    // For now, since we're having issues with the admin_users table,
    // we'll use a hardcoded check for the admin email
    if (email !== 'admin@example.com') {
      return { 
        success: false, 
        error: "Identifiants invalides ou vous n'avez pas les droits d'administration" 
      };
    }
    
    // Create admin user object without querying the admin_users table
    const admin: AdminUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: 'admin',
      first_name: data.user.user_metadata?.first_name || "",
      last_name: data.user.user_metadata?.last_name || "",
    };

    // Store admin user in localStorage
    localStorage.setItem('adminUser', JSON.stringify(admin));

    // Note: We're skipping admin_logs as commented in the code

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


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AdminCredentials = {
  email: string;
  password: string;
};

export type AdminUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string | null;
  last_login: string | null;
};

// Login admin user
export const loginAdmin = async ({ email, password }: AdminCredentials) => {
  try {
    // Fetch admin user with the given email
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    if (!adminUser) return { success: false, error: "Identifiants invalides" };

    // In a real implementation, you would use bcrypt to compare passwords
    // For demo purposes, we're doing a simple comparison
    const isValidPassword = password === adminUser.password;

    if (!isValidPassword) {
      return { success: false, error: "Identifiants invalides" };
    }

    // Update last login time
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Log admin action
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminUser.id,
        action_type: 'login',
        description: `Admin ${adminUser.email} s'est connecté`
      });

    // Store admin session in localStorage
    localStorage.setItem('admin_user', JSON.stringify(adminUser));

    return { 
      success: true, 
      admin: adminUser 
    };
  } catch (error: any) {
    console.error("Admin login error:", error);
    return { success: false, error: error.message || "Erreur lors de la connexion" };
  }
};

// Logout admin user
export const logoutAdmin = () => {
  localStorage.removeItem('admin_user');
  return { success: true };
};

// Get current admin user from localStorage
export const getCurrentAdmin = (): AdminUser | null => {
  const adminJson = localStorage.getItem('admin_user');
  return adminJson ? JSON.parse(adminJson) : null;
};

// Log admin action
export const logAdminAction = async (
  adminId: string,
  actionType: 'user_management' | 'project_management' | 'wallet_management' | 'withdrawal_management',
  description: string,
  targetUserId?: string,
  targetProjectId?: string,
  amount?: number
) => {
  try {
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        description,
        target_user_id: targetUserId,
        target_project_id: targetProjectId,
        amount
      });
  } catch (error) {
    console.error("Error logging admin action:", error);
  }
};

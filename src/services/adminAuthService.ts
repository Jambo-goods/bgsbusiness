
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
    console.log("Attempting login with email:", email);
    
    // Log the credentials being used (without the full password)
    console.log("Login attempt with:", { 
      email, 
      passwordLength: password ? password.length : 0 
    });

    // Fetch admin user with the given email
    const { data: adminUsers, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.trim().toLowerCase());

    if (error) {
      console.error("Error fetching admin user:", error);
      toast.error("Erreur lors de la récupération des informations de l'administrateur");
      return { success: false, error: "Erreur de connexion à la base de données" };
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log("No admin user found with this email");
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    const adminUser = adminUsers[0];
    console.log("Admin user found:", adminUser);
    
    // Direct password comparison - without trimming to be exact
    const isValidPassword = password === adminUser.password;

    console.log("Password validation result:", isValidPassword);

    if (!isValidPassword) {
      console.log("Invalid password provided");
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    console.log("Password validated successfully");

    // Update last login time
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);
      
    if (updateError) {
      console.error("Error updating last login:", updateError);
    }

    // Log admin action
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminUser.id,
        action_type: 'login',
        description: `Admin ${adminUser.email} s'est connecté`
      });
      
    if (logError) {
      console.error("Error logging admin action:", logError);
    }

    // Store admin session in localStorage
    localStorage.setItem('admin_user', JSON.stringify(adminUser));
    
    console.log("Login successful, admin session stored");

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

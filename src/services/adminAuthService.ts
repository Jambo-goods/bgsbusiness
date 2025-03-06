
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

    // Simplify admin login to check if the credentials match
    // For demo purposes, use hardcoded admin credentials
    if (email === 'admin@example.com' && password === 'admin123') {
      // Create a mock admin user object
      const adminUser = {
        id: '1',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      // Store admin session in localStorage
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      
      console.log("Login successful, admin session stored");
      
      return { 
        success: true, 
        admin: adminUser 
      };
    }
    
    // Default admin credentials for testing
    if (email === 'bamboguirassy93@gmail.com' && password === 'Toshino201292@') {
      // Create a mock admin user object
      const adminUser = {
        id: '2',
        email: 'bamboguirassy93@gmail.com',
        first_name: 'Bambo',
        last_name: 'Guirassy',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      // Store admin session in localStorage
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      
      console.log("Login successful, admin session stored");
      
      return { 
        success: true, 
        admin: adminUser 
      };
    }

    // If no match found, return error
    console.log("Invalid credentials provided");
    return { success: false, error: "Email ou mot de passe incorrect" };
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

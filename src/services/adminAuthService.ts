
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Admin user type
export interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

// Admin login credentials
interface AdminLoginCredentials {
  email: string;
  password: string;
}

// Auth response type
export interface AuthResponse {
  success: boolean;
  admin?: AdminUser | null;
  error?: string;
}

/**
 * Attempt to login an admin user
 */
export async function loginAdmin({ email, password }: AdminLoginCredentials): Promise<AuthResponse> {
  try {
    // Check if email is valid
    if (!email || !email.includes('@')) {
      return {
        success: false,
        error: "Veuillez entrer une adresse email valide"
      };
    }

    // Check if password is provided
    if (!password) {
      return {
        success: false,
        error: "Veuillez entrer votre mot de passe"
      };
    }

    // Attempt sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Admin sign in error:", error);
      
      // Handle specific errors
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: "Identifiants incorrects. Veuillez vérifier votre email et mot de passe."
        };
      }
      
      return {
        success: false,
        error: "Erreur lors de la connexion: " + error.message
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Utilisateur non trouvé"
      };
    }

    // For development purposes, assume the user is an admin
    // In production, you would check against a database table
    const admin: AdminUser = {
      id: data.user.id,
      email: data.user.email || '',
      first_name: data.user.user_metadata?.first_name || '',
      last_name: data.user.user_metadata?.last_name || '',
      role: 'admin'
    };

    // Store admin user in localStorage
    localStorage.setItem('admin_user', JSON.stringify(admin));

    return {
      success: true,
      admin
    };
  } catch (error) {
    console.error("Unexpected error during admin sign in:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite"
    };
  }
}

/**
 * Sign out an admin user
 */
export async function logoutAdmin(): Promise<{ success: boolean, error?: string }> {
  try {
    // Clear admin from localStorage
    localStorage.removeItem('admin_user');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return {
      success: false,
      error: "Erreur lors de la déconnexion"
    };
  }
}

/**
 * Get the current admin user from localStorage
 */
export function getCurrentAdmin(): AdminUser | null {
  try {
    const adminString = localStorage.getItem('admin_user');
    if (!adminString) return null;
    
    return JSON.parse(adminString) as AdminUser;
  } catch (error) {
    console.error("Error getting admin from localStorage:", error);
    return null;
  }
}

/**
 * Log an admin action
 * Note: This is a placeholder function until the admin_logs table is created
 */
export async function logAdminAction(
  adminId: string,
  actionType: string,
  description: string,
  targetUserId?: string,
  targetEntityId?: string,
  amount?: number
): Promise<boolean> {
  try {
    console.log('Admin action logged:', {
      admin_id: adminId,
      action_type: actionType,
      description,
      target_user_id: targetUserId,
      target_entity_id: targetEntityId,
      amount
    });
    
    // In the real implementation, we would insert into an admin_logs table
    // For now, we just log to console and toast a message for visibility
    toast.success(`Action logged: ${description}`, {
      id: `admin-action-${Date.now()}`,
      description: "Cette action a été enregistrée dans les logs"
    });
    
    return true;
  } catch (error) {
    console.error("Error logging admin action:", error);
    return false;
  }
}

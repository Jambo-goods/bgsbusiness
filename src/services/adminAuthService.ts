
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Admin user type
export interface AdminUser {
  id: string;
  email: string;
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

    // First check if the email exists in the admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (adminError || !adminUser) {
      console.error("Admin check error:", adminError);
      return {
        success: false,
        error: "Cet utilisateur n'est pas un administrateur"
      };
    }

    // If admin exists, attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Admin sign in error:", error);
      
      // If it's a new user and we're using hardcoded credentials, let's try to create the account
      if (error.message.includes('Invalid login credentials') && 
          email === 'admin@example.com' && 
          password === 'admin123') {
        try {
          // Try to sign up the admin user
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: 'admin'
              }
            }
          });

          if (signUpError) {
            return {
              success: false,
              error: "Impossible de créer le compte admin: " + signUpError.message
            };
          }

          if (signUpData.user) {
            // Admin successfully created, now sign in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            });

            if (signInError) {
              return {
                success: false,
                error: "Utilisateur créé mais connexion échouée: " + signInError.message
              };
            }

            const admin: AdminUser = {
              id: signInData.user.id,
              email: signInData.user.email || '',
              role: 'admin'
            };

            localStorage.setItem('admin_user', JSON.stringify(admin));
            return {
              success: true,
              admin
            };
          }
        } catch (signUpErr) {
          console.error("Admin sign up error:", signUpErr);
        }
      }
      
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

    // Create admin user object with data from admin_users table
    const admin: AdminUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: adminUser.role || 'admin'
    };

    // Store admin user in localStorage
    localStorage.setItem('admin_user', JSON.stringify(admin));

    return {
      success: true,
      admin
    };
  } catch (error: any) {
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
    toast.success(`Action enregistrée: ${description}`, {
      id: `admin-action-${Date.now()}`,
      description: "Cette action a été enregistrée dans les logs"
    });
    
    return true;
  } catch (error) {
    console.error("Error logging admin action:", error);
    return false;
  }
}

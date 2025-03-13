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

    console.log("Attempting admin login with:", email);

    // First attempt to sign in
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
            // Insert into admin_users table first
            const { error: insertError } = await supabase
              .from('admin_users')
              .insert({
                email: email,
                role: 'admin'
              });

            if (insertError) {
              console.error("Error inserting into admin_users:", insertError);
            }

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

    // Now check if this user is in the admin_users table
    const { data: adminUsers, error: adminQueryError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email);

    if (adminQueryError) {
      console.error("Error checking admin status:", adminQueryError);
      return {
        success: false,
        error: "Erreur lors de la vérification des droits d'administrateur"
      };
    }

    // If no admin user found with this email
    if (!adminUsers || adminUsers.length === 0) {
      // Insert this user as admin if it's the default admin
      if (email === 'admin@example.com') {
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            email: email,
            role: 'admin'
          });

        if (insertError) {
          console.error("Error inserting admin user:", insertError);
          return {
            success: false,
            error: "Erreur lors de la création du compte admin"
          };
        }
      } else {
        return {
          success: false,
          error: "Cet utilisateur n'est pas un administrateur"
        };
      }
    }

    // Create admin user object
    const admin: AdminUser = {
      id: data.user.id,
      email: data.user.email || '',
      role: 'admin'
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
    
    // Insert into admin_logs table
    const { error } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        description,
        user_id: targetUserId,
        project_id: targetEntityId,
        amount
      });
      
    if (error) {
      console.error("Error logging admin action:", error);
      return false;
    }
    
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

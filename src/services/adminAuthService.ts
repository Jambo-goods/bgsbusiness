
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminLoginCredentials {
  email: string;
  password: string;
}

interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  user?: AdminUser | null;
  error?: string;
}

export async function signInAdmin({ email, password }: AdminLoginCredentials): Promise<AuthResponse> {
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

    // Check if user is an admin using RPC function
    const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin', {
      user_email: email
    });

    if (isAdminError) {
      console.error("Error checking admin status:", isAdminError);
      
      // Sign out the user if they're not an admin
      await supabase.auth.signOut();
      
      return {
        success: false,
        error: "Erreur de vérification des privilèges administrateur"
      };
    }

    if (!isAdminData) {
      // Sign out the user if they're not an admin
      await supabase.auth.signOut();
      
      return {
        success: false,
        error: "Vous n'avez pas les privilèges administrateur nécessaires"
      };
    }

    // Log the successful login (note: admin_logs table doesn't exist yet)
    /*
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: data.user.id,
        action_type: 'login',
        description: `Connexion administrateur depuis ${getClientInfo()}`
      });
    */

    // Return the user data
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        firstName: data.user.user_metadata?.first_name || '',
        lastName: data.user.user_metadata?.last_name || ''
      }
    };
  } catch (error) {
    console.error("Unexpected error during admin sign in:", error);
    return {
      success: false,
      error: "Une erreur inattendue s'est produite"
    };
  }
}

export async function signOutAdmin(): Promise<{ success: boolean, error?: string }> {
  try {
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

export async function getAdminSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return data.session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

function getClientInfo() {
  return `${navigator.platform}, ${navigator.userAgent}`;
}

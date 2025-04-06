import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserCredentials = {
  email: string;
  password: string;
};

export type UserRegistrationData = UserCredentials & {
  firstName: string;
  lastName: string;
};

export const registerUser = async (userData: UserRegistrationData) => {
  try {
    console.log("Tentative d'inscription avec:", { 
      firstName: userData.firstName, 
      lastName: userData.lastName, 
      email: userData.email
    });
    
    // Vérifier d'abord si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', userData.email)
      .maybeSingle();
      
    if (existingUser) {
      return { 
        success: false, 
        error: "Cet email est déjà utilisé. Veuillez vous connecter."
      };
    }
    
    // Inscription avec Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      },
    });

    if (error) {
      // If there's a permission error, provide more specific feedback
      if (error.message.includes("permission denied")) {
        console.error("Permission error during signup:", error);
        return { 
          success: false, 
          error: "Erreur de permission lors de l'inscription. Veuillez contacter l'administrateur."
        };
      }
      throw error;
    }
    
    console.log("User registration successful:", data);
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle specific registration errors
    if (error.message.includes("User already registered")) {
      toast.error("Cet email est déjà utilisé. Veuillez vous connecter.");
      return { success: false, error: "Cet email est déjà utilisé" };
    }

    if (error.message.includes("permission denied")) {
      toast.error("Erreur de permission lors de l'inscription. L'administrateur a été notifié.");
      return { success: false, error: "Erreur de permission lors de l'inscription" };
    }

    toast.error(error.message || "Erreur lors de l'inscription");
    return { success: false, error: error.message || "Erreur lors de l'inscription" };
  }
};

export const loginUser = async ({ email, password }: UserCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Login error:", error);
    
    // Handle specific login errors
    if (error.message === "Invalid login credentials") {
      return { success: false, error: "Email ou mot de passe incorrect" };
    } else if (error.message.includes("rate limit")) {
      return { success: false, error: "Trop de tentatives de connexion. Veuillez réessayer plus tard." };
    }
    
    return { success: false, error: error.message || "Une erreur s'est produite lors de la connexion" };
  }
};

export const logoutUser = async () => {
  try {
    // Clean up all possible storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Try to sign out from Supabase
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.warn("Supabase signOut error:", error);
        // Continue with logout flow even if there's a Supabase error
      }
    } catch (signOutError) {
      console.warn("Exception during signOut:", signOutError);
      // Continue with logout flow even if signOut throws
    }
    
    console.log("Logout process completed");
    return { success: true };
  } catch (error: any) {
    console.error("Logout general error:", error);
    return { success: false, error: error.message || "An unknown error occurred" };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (!data.session) {
      return { user: null };
    }
    
    return { user: data.session.user };
  } catch (error) {
    console.error("Get current user error:", error);
    return { user: null };
  }
};

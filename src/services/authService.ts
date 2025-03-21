
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserCredentials = {
  email: string;
  password: string;
};

export type UserRegistrationData = UserCredentials & {
  firstName: string;
  lastName: string;
  referralCode?: string;
};

export const registerUser = async (userData: UserRegistrationData) => {
  try {
    // Verify referral code if provided, but don't try to fetch the profile if not needed
    if (userData.referralCode) {
      const { data: referrerData, error: referralError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', userData.referralCode)
        .single();
        
      if (referralError && !referralError.message.includes('No rows found')) {
        console.error("Error checking referral code:", referralError);
        return { success: false, error: "Erreur lors de la vérification du code parrain" };
      }
      
      if (!referrerData) {
        return { success: false, error: "Code parrain invalide" };
      }
    }
    
    // Let's sign up the user - pass the referral code in user metadata so the Supabase trigger can handle it
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          referral_code_used: userData.referralCode || null,
        },
      },
    });

    if (error) throw error;
    
    console.log("User registration successful:", data);
    
    // Let the Supabase trigger handle both profile creation and referral linking
    // No need to manually create profile here, as it causes permission issues

    return { success: true, data };
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle specific registration errors
    if (error.message.includes("User already registered")) {
      toast.error("Cet email est déjà utilisé. Veuillez vous connecter.");
      return { success: false, error: "Cet email est déjà utilisé" };
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


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

    if (error) throw error;
    
    // Manually create the profile after successful registration
    if (data?.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          investment_total: 0,
          projects_count: 0,
          wallet_balance: 0
        });
        
      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Continue anyway, as the auth trigger should handle this in production
      }
    }
    
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
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

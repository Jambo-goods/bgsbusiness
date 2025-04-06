
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthResponse } from "./types";

/**
 * Sends a password reset email to the user
 */
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    console.log("Requesting password reset for:", email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    toast.success("Un email de réinitialisation a été envoyé");
    return { success: true };
  } catch (error: any) {
    console.error("Password reset error:", error);
    
    // Handle specific errors
    if (error.message && error.message.toLowerCase().includes("email not confirmed")) {
      toast.error("L'email n'est pas confirmé. Veuillez vérifier votre boîte mail.");
      return { success: false, error: "Email non confirmé" };
    }
    
    toast.error("Erreur lors de la demande de réinitialisation");
    return { 
      success: false, 
      error: error.message || "Une erreur s'est produite lors de la demande de réinitialisation" 
    };
  }
};

/**
 * Updates the user's password with a new one
 */
export const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
  try {
    if (!newPassword || newPassword.length < 8) {
      return { 
        success: false, 
        error: "Le mot de passe doit contenir au moins 8 caractères" 
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    toast.success("Mot de passe mis à jour avec succès");
    return { success: true };
  } catch (error: any) {
    console.error("Password update error:", error);
    
    toast.error("Erreur lors de la mise à jour du mot de passe");
    return { 
      success: false, 
      error: error.message || "Une erreur s'est produite lors de la mise à jour du mot de passe" 
    };
  }
};

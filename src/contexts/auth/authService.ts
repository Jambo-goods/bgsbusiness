import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from './types';
import { toast } from 'sonner';

export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { user: data.user as AuthUser, error: null };
  } catch (error) {
    console.error('Error logging in:', error);
    return { user: null, error };
  }
}

export async function signup(email: string, password: string, metadata?: any) {
  try {
    console.log("AuthService - Étape 1: Début du processus d'inscription avec email", email);
    console.log("AuthService - Métadonnées:", metadata);
    
    const origin = window.location.origin;
    console.log("AuthService - Origin URL:", origin);
    const redirectUrl = `${origin}/login`;
    console.log("AuthService - Redirect URL:", redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName: metadata?.firstName,
          lastName: metadata?.lastName,
        },
        emailRedirectTo: redirectUrl,
      }
    });

    console.log("AuthService - Réponse brute de signUp:", data);
    
    if (error) {
      console.error("AuthService - Étape 2: Erreur Supabase lors de l'inscription:", error);
      console.error("AuthService - Type d'erreur:", typeof error);
      console.error("AuthService - Détails supplémentaires:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      if (error instanceof Error) {
        if ('cause' in error) {
          console.error("AuthService - Cause de l'erreur:", (error as any).cause);
        }
      }
      
      throw error;
    }

    console.log("AuthService - Étape 3: Réponse de Supabase signUp:", data.user ? "Utilisateur créé" : "Pas d'utilisateur créé");
    
    if (data.user) {
      console.log("AuthService - ID utilisateur créé:", data.user.id);
      console.log("AuthService - Email utilisateur:", data.user.email);
      console.log("AuthService - Métadonnées utilisateur:", data.user.user_metadata);
    }
    
    return { user: data.user as AuthUser, error: null };
  } catch (error: any) {
    console.error("AuthService - Exception lors de l'inscription:", error);
    console.error("AuthService - Type d'erreur attrapée:", typeof error);
    console.error("AuthService - Message d'erreur:", error.message);
    
    if (error instanceof Error) {
      if ('cause' in error) {
        console.error("AuthService - Cause de l'erreur:", (error as any).cause);
      }
    }
    
    const details = {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    };
    
    console.error("AuthService - Détails structurés:", details);
    console.error("AuthService - JSON stringify:", JSON.stringify(error, null, 2));
    
    return { user: null, error };
  }
}

export async function logout() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error logging out:', error);
    toast.error('Erreur lors de la déconnexion');
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error };
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error };
  }
}

export async function updateProfile(updates: any) {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error };
  }
}


import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    fullName?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signup: (email: string, password: string, metadata?: any) => Promise<{ user: User | null; error: any }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: any }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error: any }>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.info('Auth state changed:', event);
      
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    // Check for current session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setIsLoading(false);
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error logging in:', error);
      return { user: null, error };
    }
  };

  const signup = async (email: string, password: string, metadata?: any) => {
    try {
      console.log("AuthContext - Étape 1: Début du processus d'inscription avec email", email);
      console.log("AuthContext - Métadonnées:", metadata);
      
      const origin = window.location.origin;
      console.log("AuthContext - Origin URL:", origin);
      const redirectUrl = `${origin}/login`;
      console.log("AuthContext - Redirect URL:", redirectUrl);
      
      // Utilisons une approche plus directe avec tous les paramètres explicitement définis
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectUrl,
        }
      });

      console.log("AuthContext - Réponse brute de signUp:", data);
      
      if (error) {
        console.error("AuthContext - Étape 2: Erreur Supabase lors de l'inscription:", error);
        console.error("AuthContext - Type d'erreur:", typeof error);
        console.error("AuthContext - Détails supplémentaires:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        
        if (error.cause) {
          console.error("AuthContext - Cause de l'erreur:", error.cause);
        }
        
        throw error;
      }

      console.log("AuthContext - Étape 3: Réponse de Supabase signUp:", data.user ? "Utilisateur créé" : "Pas d'utilisateur créé");
      
      if (data.user) {
        console.log("AuthContext - ID utilisateur créé:", data.user.id);
        console.log("AuthContext - Email utilisateur:", data.user.email);
        console.log("AuthContext - Métadonnées utilisateur:", data.user.user_metadata);
      }
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("AuthContext - Exception lors de l'inscription:", error);
      console.error("AuthContext - Type d'erreur attrapée:", typeof error);
      console.error("AuthContext - Message d'erreur:", error.message);
      
      // Ajoutons plus d'informations de débogage
      if (error.cause) {
        console.error("AuthContext - Cause de l'erreur:", error.cause);
      }
      
      // Essayons d'extraire plus de détails
      const details = {
        name: error.name,
        message: error.message,
        status: error.status,
        code: error.code,
        details: error.details,
      };
      
      console.error("AuthContext - Détails structurés:", details);
      console.error("AuthContext - JSON stringify:", JSON.stringify(error, null, 2));
      
      return { user: null, error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const resetPassword = async (email: string) => {
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
  };

  const updatePassword = async (newPassword: string) => {
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
  };

  const updateProfile = async (updates: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }

      setUser((prevUser) => {
        if (!prevUser) return null;
        
        return {
          ...prevUser,
          user_metadata: {
            ...prevUser.user_metadata,
            ...updates,
          },
        };
      });

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

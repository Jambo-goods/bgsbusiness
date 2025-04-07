
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser } from './types';
import * as authService from './authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.info('Auth state changed:', event);
      
      if (session?.user) {
        setUser(session.user as AuthUser);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    // Check for current session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user as AuthUser);
      }
      setIsLoading(false);
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateProfileState = (updates: any) => {
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
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login: authService.login,
    signup: authService.signup,
    logout: authService.logout,
    resetPassword: authService.resetPassword,
    updatePassword: authService.updatePassword,
    updateProfile: async (updates) => {
      const result = await authService.updateProfile(updates);
      if (result.success) {
        updateProfileState(updates);
      }
      return result;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

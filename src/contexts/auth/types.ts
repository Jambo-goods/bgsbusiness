
import { Session, User } from "@supabase/supabase-js";

export interface AuthUser extends User {
  user_metadata?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    referralCode?: string;
  };
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: AuthUser | null; error: any }>;
  signup: (email: string, password: string, metadata?: any) => Promise<{ user: AuthUser | null; error: any }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: any }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error: any }>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error: any }>;
}

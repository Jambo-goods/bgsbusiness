
import { Session, User } from "@supabase/supabase-js";

// Instead of extending the User interface and making required properties optional,
// let's create our own AuthUser type that includes the User type
export type AuthUser = User & {
  // Override the user_metadata to include our specific properties
  user_metadata: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    referralCode?: string;
  };
};

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

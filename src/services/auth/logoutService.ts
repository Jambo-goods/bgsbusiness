
import { supabase } from "@/integrations/supabase/client";
import { AuthResponse } from "./types";

/**
 * Logs out the current user and clears local storage
 */
export const logoutUser = async (): Promise<AuthResponse> => {
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

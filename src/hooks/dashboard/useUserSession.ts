
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useUserSession = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          // Redirect to login if no user is found
          console.log("No active session found, redirecting to login");
          navigate("/login");
          return null;
        }
        
        const userId = sessionData.session.user.id;
        setUserId(userId);
        
        // Check if the user has a profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        // If no profile exists, create one
        if (!profileData && sessionData.session.user) {
          const userData = sessionData.session.user;
          console.log("Creating profile for user:", userId);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              first_name: userData.user_metadata?.first_name || "User",
              last_name: userData.user_metadata?.last_name || "",
              email: userData.email,
              investment_total: 0,
              projects_count: 0,
              wallet_balance: 0
            });
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast.error("Error creating your profile. Please try logging in again.");
          } else {
            console.log("Profile created successfully");
          }
        }
        
        return userId;
      } catch (error) {
        console.error("Error checking session:", error);
        toast.error("Authentication error. Please try logging in again.");
        navigate("/login");
        return null;
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  return { userId, isLoading };
};

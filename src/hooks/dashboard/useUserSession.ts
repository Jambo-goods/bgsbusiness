
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
          navigate("/login");
          return null;
        }
        
        setUserId(sessionData.session.user.id);
        return sessionData.session.user.id;
      } catch (error) {
        console.error("Error checking session:", error);
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

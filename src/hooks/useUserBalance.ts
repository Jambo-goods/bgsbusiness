
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserBalance = () => {
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', session.session.user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUserBalance(data.wallet_balance || 0);
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserBalance();
  }, []);

  return { userBalance, isLoading };
};

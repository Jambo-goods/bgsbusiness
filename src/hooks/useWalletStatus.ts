
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWalletStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const checkUserSession = async () => {
    setLoading(true);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    
    if (user) {
      setIsLoggedIn(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Erreur lors de la récupération du solde:", error);
      } else if (data) {
        setWalletBalance(data.wallet_balance ?? 0);

        if (data.wallet_balance === null || data.wallet_balance === undefined) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              wallet_balance: 0
            })
            .eq('id', user.id);
            
          if (updateError) {
            console.error("Erreur lors de l'initialisation du solde:", updateError);
          }
        }
      }
    } else {
      setIsLoggedIn(false);
      setWalletBalance(0);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    checkUserSession();
  }, []);

  return {
    isLoggedIn,
    walletBalance,
    loading,
    refreshWalletStatus: checkUserSession
  };
}


import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useMissingDeposit() {
  const [hasMissingDeposit, setHasMissingDeposit] = useState(false);
  
  const checkForMissingDeposit = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) return;
      
      const { data: transfer } = await supabase
        .from('bank_transfers')
        .select('*')
        .eq('user_id', session.session.user.id)
        .ilike('reference', '%DEP-396509%')
        .eq('status', 'completed')
        .maybeSingle();
        
      if (transfer) {
        const { data: transaction } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('amount', transfer.amount)
          .ilike('description', '%DEP-396509%')
          .eq('status', 'completed')
          .maybeSingle();
          
        setHasMissingDeposit(!transaction);
      }
    } catch (error) {
      console.error("Error checking for missing deposit:", error);
    }
  }, []);

  useEffect(() => {
    checkForMissingDeposit();
  }, [checkForMissingDeposit]);

  return {
    hasMissingDeposit,
    setHasMissingDeposit,
    checkForMissingDeposit
  };
}

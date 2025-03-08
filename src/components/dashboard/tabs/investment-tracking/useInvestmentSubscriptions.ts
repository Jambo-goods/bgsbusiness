
import { useEffect } from "react";

export const useInvestmentSubscriptions = (
  userId: string | null,
  refreshCallback: () => void
) => {
  useEffect(() => {
    console.log("Real-time subscriptions have been disabled");
    
    // No real-time subscriptions are set up
    
    return () => {
      // No cleanup needed
    };
  }, [userId, refreshCallback]);
};


import { useState, useEffect } from "react";

export const useProfilesRealTimeSubscription = (
  initialProfiles: any[],
  onProfilesUpdate: () => void
) => {
  // This hook no longer provides real-time functionality
  // It's kept as a placeholder to avoid breaking existing code references
  
  useEffect(() => {
    console.log("Real-time subscriptions have been disabled");
    
    // No real-time subscriptions are set up
    
    return () => {
      // No cleanup needed
    };
  }, [onProfilesUpdate]);

  return { realTimeStatus: null };
};

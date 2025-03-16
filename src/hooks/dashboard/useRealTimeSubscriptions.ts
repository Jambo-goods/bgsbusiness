
import { useState, useEffect, useRef } from "react";

interface SubscriptionOptions {
  userId: string;
  onProfileUpdate?: () => void;
  onInvestmentUpdate?: () => void;
  onTransactionUpdate?: () => void;
  pollingInterval?: number; // in milliseconds
}

export const useRealTimeSubscriptions = ({
  userId,
  onProfileUpdate,
  onInvestmentUpdate,
  onTransactionUpdate,
  pollingInterval = 60000 // Default polling every 60 seconds
}: SubscriptionOptions) => {
  const [pollingStatus, setPollingStatus] = useState<'disabled' | 'active' | 'error'>('disabled');
  const pollingTimerRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<{
    profile: number;
    investment: number;
    transaction: number;
  }>({
    profile: 0,
    investment: 0,
    transaction: 0
  });

  // Start polling when component mounts
  useEffect(() => {
    if (!userId) {
      console.log("No user ID provided. Polling disabled.");
      return;
    }

    const startPolling = () => {
      setPollingStatus('active');
      console.log(`Polling started with interval of ${pollingInterval}ms`);

      // Clear any existing interval
      if (pollingTimerRef.current) {
        window.clearInterval(pollingTimerRef.current);
      }

      // Create new polling interval with throttling
      pollingTimerRef.current = window.setInterval(() => {
        console.log("Polling for updates...");
        const now = Date.now();
        
        // Throttle profile updates (max once every 30 seconds)
        if (onProfileUpdate && now - lastUpdateRef.current.profile > 30000) {
          onProfileUpdate();
          lastUpdateRef.current.profile = now;
        }
        
        // Throttle investment updates (max once every 45 seconds)
        if (onInvestmentUpdate && now - lastUpdateRef.current.investment > 45000) {
          onInvestmentUpdate();
          lastUpdateRef.current.investment = now;
        }
        
        // Throttle transaction updates (max once every 60 seconds)
        if (onTransactionUpdate && now - lastUpdateRef.current.transaction > 60000) {
          onTransactionUpdate();
          lastUpdateRef.current.transaction = now;
        }
      }, pollingInterval);
    };

    // Start polling
    startPolling();

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up polling interval");
      if (pollingTimerRef.current) {
        window.clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      setPollingStatus('disabled');
    };
  }, [userId, pollingInterval, onProfileUpdate, onInvestmentUpdate, onTransactionUpdate]);

  // Function to manually trigger updates
  const triggerManualUpdate = (type: 'profile' | 'investment' | 'transaction') => {
    const now = Date.now();
    
    if (type === 'profile' && onProfileUpdate) {
      onProfileUpdate();
      lastUpdateRef.current.profile = now;
    } else if (type === 'investment' && onInvestmentUpdate) {
      onInvestmentUpdate();
      lastUpdateRef.current.investment = now;
    } else if (type === 'transaction' && onTransactionUpdate) {
      onTransactionUpdate();
      lastUpdateRef.current.transaction = now;
    }
  };

  return { 
    pollingStatus,
    triggerManualUpdate
  };
};

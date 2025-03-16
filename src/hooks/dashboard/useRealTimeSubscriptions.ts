
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

      // Create new polling interval
      pollingTimerRef.current = window.setInterval(() => {
        console.log("Polling for updates...");
        
        // Trigger all update callbacks
        if (onProfileUpdate) onProfileUpdate();
        if (onInvestmentUpdate) onInvestmentUpdate();
        if (onTransactionUpdate) onTransactionUpdate();
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
    if (type === 'profile' && onProfileUpdate) {
      onProfileUpdate();
    } else if (type === 'investment' && onInvestmentUpdate) {
      onInvestmentUpdate();
    } else if (type === 'transaction' && onTransactionUpdate) {
      onTransactionUpdate();
    }
  };

  return { 
    pollingStatus,
    triggerManualUpdate
  };
};

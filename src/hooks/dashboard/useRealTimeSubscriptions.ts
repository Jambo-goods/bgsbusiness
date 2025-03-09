
import { useState } from "react";

interface SubscriptionOptions {
  userId: string;
  onProfileUpdate?: () => void;
  onInvestmentUpdate?: () => void;
  onTransactionUpdate?: () => void;
}

export const useRealTimeSubscriptions = ({
  userId,
  onProfileUpdate,
  onInvestmentUpdate,
  onTransactionUpdate
}: SubscriptionOptions) => {
  const [realTimeStatus, setRealTimeStatus] = useState<'disabled' | 'connecting' | 'connected' | 'error'>('disabled');

  // Real-time functionality is now disabled
  console.log("Real-time subscriptions are disabled");
  
  // If needed, we can still manually call the callbacks
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
    realTimeStatus,
    triggerManualUpdate
  };
};

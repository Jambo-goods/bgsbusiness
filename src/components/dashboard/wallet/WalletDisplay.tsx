
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useUserBalance } from "@/hooks/useUserBalance";
import { WalletCard } from "./WalletCard"; // Changed from default import to named import

interface WalletDisplayProps {
  onRefresh?: () => void;
}

export default function WalletDisplay({ onRefresh }: WalletDisplayProps) {
  const { userBalance, isLoading } = useUserBalance();
  const [loadingTime, setLoadingTime] = useState(0);
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      timer = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);
  
  const handleRetry = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-white rounded-lg shadow p-6">
        <Loader2 className="h-8 w-8 text-bgs-orange animate-spin" />
        <p className="mt-3 text-bgs-gray-medium">Chargement du solde...</p>
        
        {loadingTime > 15 && (
          <div className="mt-4">
            <button 
              onClick={handleRetry}
              className="flex items-center text-sm text-bgs-blue hover:underline"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return <WalletCard balance={userBalance} />;
}

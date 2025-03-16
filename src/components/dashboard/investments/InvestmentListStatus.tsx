
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface InvestmentListStatusProps {
  isLoading: boolean;
  isEmpty: boolean;
  onRetry?: () => void;
}

export default function InvestmentListStatus({ isLoading, isEmpty, onRetry }: InvestmentListStatusProps) {
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
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <Loader2 className="h-8 w-8 text-bgs-orange animate-spin" />
        <p className="text-sm text-bgs-gray-medium">Chargement des investissements...</p>
        
        {loadingTime > 15 && (
          <p className="text-xs text-gray-500">
            Le chargement prend plus de temps que prévu...
          </p>
        )}
        
        {loadingTime > 30 && onRetry && (
          <button 
            onClick={onRetry}
            className="flex items-center text-xs text-bgs-blue hover:underline mt-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Réessayer
          </button>
        )}
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg bg-white shadow-sm">
        <p className="text-sm text-bgs-gray-medium">Aucun investissement trouvé</p>
        <p className="text-xs text-gray-500 mt-2">Consultez nos opportunités pour commencer à investir</p>
      </div>
    );
  }
  
  return null;
}


import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingStateProps {
  onRetry?: () => void;
}

export default function LoadingState({ onRetry }: LoadingStateProps) {
  const [loadingTime, setLoadingTime] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 text-bgs-blue animate-spin" />
      <p className="text-sm text-bgs-gray-medium mt-3">Chargement des données...</p>
      
      {loadingTime > 15 && (
        <p className="text-xs text-gray-500 mt-2">
          Le chargement prend plus de temps que prévu...
        </p>
      )}
      
      {loadingTime > 30 && onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 flex items-center text-sm text-bgs-blue hover:underline"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Réessayer
        </button>
      )}
    </div>
  );
}

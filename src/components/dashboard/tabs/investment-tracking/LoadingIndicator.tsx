
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
  timeout?: number;
}

export default function LoadingIndicator({ 
  message = "Chargement des données...", 
  className = "",
  timeout = 0
}: LoadingIndicatorProps) {
  const [showRetry, setShowRetry] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  
  // Track loading time
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
      if (prev >= 15 && !showRetry) {
        setShowRetry(true);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showRetry]);
  
  return (
    <div className={`py-8 flex flex-col items-center justify-center ${className}`}>
      <Loader2 className="h-8 w-8 text-bgs-orange animate-spin mb-3" />
      <p className="text-sm text-bgs-gray-medium">{message}</p>
      <p className="text-xs text-gray-400 mt-2">
        {loadingTime > 15 || timeout > 15 || showRetry 
          ? "Le chargement prend plus de temps que prévu..." 
          : "Veuillez patienter pendant le chargement"}
      </p>
      
      {(loadingTime > 20 || timeout > 20 || showRetry) && (
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded border border-bgs-blue text-sm text-bgs-blue hover:bg-blue-50"
        >
          <RefreshCw className="h-3 w-3" />
          Rafraîchir la page
        </button>
      )}
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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
  
  // Show retry option after 20 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 20000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`py-8 flex flex-col items-center justify-center ${className}`}>
      <Loader2 className="h-8 w-8 text-bgs-orange animate-spin mb-3" />
      <p className="text-sm text-bgs-gray-medium">{message}</p>
      <p className="text-xs text-gray-400 mt-2">
        {timeout > 15 || showRetry 
          ? "Le chargement prend plus de temps que prévu..." 
          : "Veuillez patienter pendant le chargement"}
      </p>
      
      {(timeout > 30 || showRetry) && (
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-xs text-bgs-blue hover:underline"
        >
          Rafraîchir la page
        </button>
      )}
    </div>
  );
}

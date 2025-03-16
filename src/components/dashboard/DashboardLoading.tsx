
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface DashboardLoadingProps {
  message?: string;
  timeout?: number;
}

export default function DashboardLoading({ 
  message = "Chargement du tableau de bord...", 
  timeout = 0
}: DashboardLoadingProps) {
  const [loadingTime, setLoadingTime] = useState(0);
  
  // Track loading time
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Choose message based on loading time
  const getTimeoutMessage = () => {
    if (loadingTime > 30) {
      return "Le chargement prend beaucoup plus de temps que prévu. Veuillez rafraîchir la page.";
    } else if (loadingTime > 15) {
      return "Le chargement prend plus de temps que prévu. Veuillez patienter...";
    } else {
      return "Patientez pendant le chargement des données...";
    }
  };
    
  return (
    <div className="flex items-center justify-center min-h-[300px] w-full bg-white bg-opacity-90">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 text-bgs-orange animate-spin" />
        <div className="text-bgs-blue font-medium">{message}</div>
        <div className="text-sm text-gray-500 mt-2">{getTimeoutMessage()}</div>
        {loadingTime > 20 && (
          <div className="mt-4 text-sm">
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center gap-2 text-bgs-blue hover:underline px-4 py-2 border border-bgs-blue rounded"
            >
              <RefreshCw className="h-4 w-4" />
              Rafraîchir la page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

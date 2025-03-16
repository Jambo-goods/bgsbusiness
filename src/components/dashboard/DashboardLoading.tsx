
import React from "react";
import { Loader2 } from "lucide-react";

interface DashboardLoadingProps {
  message?: string;
  timeout?: number;
}

export default function DashboardLoading({ 
  message = "Chargement du tableau de bord...", 
  timeout = 0 
}: DashboardLoadingProps) {
  // Show different message if loading takes too long
  const timeoutMessage = timeout > 15 
    ? "Le chargement prend plus de temps que prévu..." 
    : "Patientez pendant le chargement des données...";
    
  return (
    <div className="flex items-center justify-center min-h-[300px] w-full bg-white bg-opacity-90">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 text-bgs-orange animate-spin" />
        <div className="text-bgs-blue font-medium">{message}</div>
        <div className="text-sm text-gray-500 mt-2">{timeoutMessage}</div>
        {timeout > 30 && (
          <div className="mt-4 text-sm">
            <button 
              onClick={() => window.location.reload()} 
              className="text-bgs-blue hover:underline"
            >
              Rafraîchir la page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

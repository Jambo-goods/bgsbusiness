
import React from "react";
import { RefreshCw } from "lucide-react";

interface DashboardLoadingProps {
  message?: string;
}

export default function DashboardLoading({ 
  message = "Tableau de bord" 
}: DashboardLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] w-full bg-white bg-opacity-90">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-bgs-blue font-medium">{message}</div>
        
        <div className="mt-4 text-sm">
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 text-bgs-blue hover:underline px-4 py-2 border border-bgs-blue rounded"
          >
            <RefreshCw className="h-4 w-4" />
            Rafraîchir la page
          </button>
        </div>
      </div>
    </div>
  );
}

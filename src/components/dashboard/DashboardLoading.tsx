
import React from "react";

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
      </div>
    </div>
  );
}

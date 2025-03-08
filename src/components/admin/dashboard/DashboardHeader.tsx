
import { useState } from "react";
import StatusIndicator from "./StatusIndicator";

interface DashboardHeaderProps {
  systemStatus: 'operational' | 'degraded' | 'maintenance';
  isRefreshing: boolean;
  refreshData: () => void;
}

export default function DashboardHeader({ 
  systemStatus, 
  isRefreshing, 
  refreshData 
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-2xl font-semibold text-bgs-blue mb-4 md:mb-0">
        Tableau de bord d'administration
      </h1>
      
      <StatusIndicator 
        systemStatus={systemStatus}
        isRefreshing={isRefreshing}
        onRefresh={refreshData}
      />
    </div>
  );
}


import React from "react";
import { Loader2 } from "lucide-react";

interface DashboardLoadingProps {
  message?: string;
}

export default function DashboardLoading({ message = "Chargement du tableau de bord..." }: DashboardLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px] w-full bg-white bg-opacity-90">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 text-bgs-orange animate-spin" />
        <div className="text-bgs-blue font-medium">{message}</div>
      </div>
    </div>
  );
}

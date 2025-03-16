
import React from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white bg-opacity-90">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 text-bgs-blue animate-spin" />
        <div className="text-bgs-blue font-medium">Chargement du tableau de bord...</div>
      </div>
    </div>
  );
}

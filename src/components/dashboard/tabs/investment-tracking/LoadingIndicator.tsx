
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export default function LoadingIndicator({ 
  message = "Chargement des données...", 
  className = ""
}: LoadingIndicatorProps) {
  return (
    <div className={`py-8 flex flex-col items-center justify-center ${className}`}>
      <Loader2 className="h-8 w-8 text-bgs-orange animate-spin mb-3" />
      <p className="text-sm text-bgs-gray-medium">{message}</p>
      <p className="text-xs text-gray-400 mt-2">Veuillez patienter pendant le chargement</p>
    </div>
  );
}

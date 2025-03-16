
import React from "react";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
  timeout?: number;
}

export default function LoadingIndicator({ 
  message = "Chargement des données...", 
  className = ""
}: LoadingIndicatorProps) {
  return (
    <div className={`py-8 flex flex-col items-center justify-center ${className}`}>
      <p className="text-sm text-bgs-gray-medium">{message}</p>
    </div>
  );
}

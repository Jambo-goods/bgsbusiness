
import React from "react";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export default function LoadingIndicator({ 
  message = "Contenu", 
  className = ""
}: LoadingIndicatorProps) {
  return (
    <div className={`py-8 flex flex-col items-center justify-center ${className}`}>
      <p className="text-sm text-bgs-blue">{message}</p>
    </div>
  );
}

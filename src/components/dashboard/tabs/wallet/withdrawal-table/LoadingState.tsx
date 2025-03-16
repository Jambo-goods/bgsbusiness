
import React from "react";

interface LoadingStateProps {
  onRetry?: () => void;
}

export default function LoadingState({ onRetry }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="text-sm text-bgs-gray-medium mt-3">Données en cours de chargement...</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded border border-bgs-blue text-sm text-bgs-blue hover:bg-blue-50"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

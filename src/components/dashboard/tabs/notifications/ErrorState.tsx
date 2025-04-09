
import React from "react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
      <p className="text-red-600">{error}</p>
      <button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}

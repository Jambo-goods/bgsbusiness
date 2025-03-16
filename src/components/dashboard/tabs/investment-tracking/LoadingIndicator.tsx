
import React from "react";

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({ message = "Chargement des données..." }: LoadingIndicatorProps) {
  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgs-orange mb-3"></div>
      <p className="text-sm text-bgs-gray-medium">{message}</p>
    </div>
  );
}

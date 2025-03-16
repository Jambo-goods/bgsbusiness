
import React from "react";

interface LoadingStateProps {
  onRetry?: () => void;
}

export default function LoadingState({ onRetry }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="text-sm text-bgs-blue mt-3">Contenu</p>
    </div>
  );
}

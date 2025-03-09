
import React from "react";

interface EmptyStateProps {
  isLoading: boolean;
}

export function EmptyState({ isLoading }: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
      </div>
    );
  }

  return (
    <div className="text-center p-8 border rounded-lg bg-gray-50">
      <p className="text-gray-500">Aucun virement bancaire en attente de confirmation</p>
    </div>
  );
}

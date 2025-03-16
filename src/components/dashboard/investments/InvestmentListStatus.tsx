
import React from "react";

interface InvestmentListStatusProps {
  isLoading: boolean;
  isEmpty: boolean;
  onRetry?: () => void;
}

export default function InvestmentListStatus({ isLoading, isEmpty, onRetry }: InvestmentListStatusProps) {
  if (isEmpty) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg bg-white shadow-sm">
        <p className="text-sm text-bgs-gray-medium">Aucun investissement trouvé</p>
        <p className="text-xs text-gray-500 mt-2">Consultez nos opportunités pour commencer à investir</p>
      </div>
    );
  }
  
  return null;
}

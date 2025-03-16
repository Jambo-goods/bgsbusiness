
import React from "react";

interface InvestmentListStatusProps {
  isLoading: boolean;
  isEmpty: boolean;
}

export default function InvestmentListStatus({ isLoading, isEmpty }: InvestmentListStatusProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgs-orange"></div>
      </div>
    );
  }
  
  if (isEmpty) {
    return (
      <div className="text-center py-8 border border-gray-200 rounded-lg bg-white shadow-sm">
        <p className="text-sm text-bgs-gray-medium">Aucun investissement trouvé</p>
      </div>
    );
  }
  
  return null;
}

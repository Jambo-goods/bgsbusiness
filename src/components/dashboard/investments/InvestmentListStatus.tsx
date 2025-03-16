
import React from "react";
import { Loader2 } from "lucide-react";

interface InvestmentListStatusProps {
  isLoading: boolean;
  isEmpty: boolean;
}

export default function InvestmentListStatus({ isLoading, isEmpty }: InvestmentListStatusProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <Loader2 className="h-8 w-8 text-bgs-orange animate-spin" />
        <p className="text-sm text-bgs-gray-medium">Chargement des investissements...</p>
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

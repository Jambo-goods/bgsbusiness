
import React from "react";
import { RefreshCcw } from "lucide-react";

interface HeaderSectionProps {
  handleRefresh: () => void;
  isLoading: boolean;
  animateRefresh: boolean;
  dataSource?: string;
}

export default function HeaderSection({ 
  handleRefresh, 
  isLoading, 
  animateRefresh,
  dataSource = "temps réel"
}: HeaderSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-bgs-blue flex items-center gap-2">
        Suivi des rendements
        <button 
          onClick={handleRefresh}
          className="text-gray-400 hover:text-bgs-blue transition-colors"
          title="Rafraîchir les données"
          disabled={isLoading}
        >
          <RefreshCcw 
            className={`h-4 w-4 ${animateRefresh ? 'animate-spin' : ''}`} 
          />
        </button>
      </h2>
      <p className="text-xs text-bgs-gray-medium mt-1">
        Données provenant de {dataSource}
      </p>
    </div>
  );
}

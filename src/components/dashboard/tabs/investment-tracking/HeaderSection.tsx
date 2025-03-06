
import React from "react";
import { RefreshCcw } from "lucide-react";

interface HeaderSectionProps {
  handleRefresh: () => void;
  isLoading: boolean;
  animateRefresh: boolean;
}

export default function HeaderSection({ 
  handleRefresh, 
  isLoading, 
  animateRefresh 
}: HeaderSectionProps) {
  return (
    <h2 className="text-lg font-medium text-bgs-blue flex items-center gap-2">
      Suivi des rendements
      <button 
        onClick={handleRefresh}
        className="text-gray-500 hover:text-bgs-blue transition-colors"
        title="Rafraîchir les données"
        disabled={isLoading}
      >
        <RefreshCcw 
          className={`h-4 w-4 ${animateRefresh ? 'animate-spin' : ''}`} 
        />
      </button>
    </h2>
  );
}

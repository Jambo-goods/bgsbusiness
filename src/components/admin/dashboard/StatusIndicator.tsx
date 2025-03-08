
import React from 'react';
import { RefreshCw } from 'lucide-react';

type StatusIndicatorProps = {
  realTimeStatus: 'connecting' | 'connected' | 'error';
  isRefreshing: boolean;
  onRefresh: () => void;
};

export default function StatusIndicator({ 
  realTimeStatus, 
  isRefreshing, 
  onRefresh 
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        <div className="h-2.5 w-2.5 rounded-full mr-2 bg-gray-400"></div>
        <span className="text-sm font-medium text-gray-700 mr-3">
          Données en temps réel désactivées
        </span>
      </div>
      <button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-bgs-blue to-bgs-blue-light text-white rounded-lg hover:shadow-md transition-all duration-200"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualiser
      </button>
    </div>
  );
}

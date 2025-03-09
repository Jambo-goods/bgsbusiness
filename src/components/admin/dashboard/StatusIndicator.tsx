
import React from 'react';
import { RefreshCw } from 'lucide-react';

type StatusIndicatorProps = {
  systemStatus: 'operational' | 'degraded' | 'maintenance';
  isRefreshing: boolean;
  onRefresh: () => void;
};

export default function StatusIndicator({ 
  systemStatus, 
  isRefreshing, 
  onRefresh 
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
          systemStatus === 'operational' ? 'bg-green-500 animate-pulse' : 
          systemStatus === 'degraded' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500 animate-pulse'
        }`}></div>
        <span className="text-sm font-medium text-gray-700 mr-3">
          {systemStatus === 'operational' ? 'Système opérationnel' : 
          systemStatus === 'degraded' ? 'Performance dégradée' : 'Maintenance en cours'}
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

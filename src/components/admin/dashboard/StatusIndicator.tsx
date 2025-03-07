
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
        <div className={`h-2 w-2 rounded-full mr-2 ${
          realTimeStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
          realTimeStatus === 'error' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500 animate-pulse'
        }`}></div>
        <span className="text-sm text-gray-600 mr-3">
          {realTimeStatus === 'connected' ? 'Temps réel actif' : 
          realTimeStatus === 'error' ? 'Erreur de connexion' : 'Connexion...'}
        </span>
      </div>
      <button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-4 py-2 bg-bgs-blue text-white rounded-lg hover:bg-bgs-blue-dark transition-colors"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualiser
      </button>
    </div>
  );
}

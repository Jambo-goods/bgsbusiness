import React from 'react';
import { RefreshCw } from 'lucide-react';
type StatusIndicatorProps = {
  systemStatus?: 'operational' | 'degraded' | 'maintenance';
  realTimeStatus?: 'connected' | 'connecting' | 'error';
  isRefreshing: boolean;
  onRefresh: () => void;
};
export default function StatusIndicator({
  systemStatus = 'operational',
  realTimeStatus,
  isRefreshing,
  onRefresh
}: StatusIndicatorProps) {
  // Determine which status to display (prefer systemStatus if both are provided)
  const statusToShow = systemStatus || (realTimeStatus === 'connected' ? 'operational' : realTimeStatus === 'connecting' ? 'degraded' : 'maintenance');
  return <div className="flex items-center gap-3">
      
      <button onClick={onRefresh} disabled={isRefreshing} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-bgs-blue to-bgs-blue-light text-white rounded-lg hover:shadow-md transition-all duration-200">
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualiser
      </button>
    </div>;
}
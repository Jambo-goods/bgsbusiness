
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface StatusIndicatorProps {
  systemStatus: 'operational' | 'degraded' | 'down';
  isRefreshing: boolean;
  onRefresh: () => void;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  systemStatus,
  isRefreshing,
  onRefresh
}) => {
  // Status text and color based on system status
  const getStatusColor = () => {
    switch (systemStatus) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <div className={`w-2 h-2 ${getStatusColor()} rounded-full mr-1`} />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>Actualiser</span>
      </Button>
    </div>
  );
};

export default StatusIndicator;

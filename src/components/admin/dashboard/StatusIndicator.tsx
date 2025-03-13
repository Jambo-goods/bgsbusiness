
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
  return (
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
  );
};

export default StatusIndicator;

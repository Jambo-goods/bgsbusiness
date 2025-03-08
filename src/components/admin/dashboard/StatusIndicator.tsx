
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { useOfflineUsersCount } from '@/hooks/admin/useOfflineUsersCount';

export interface StatusIndicatorProps {
  systemStatus?: 'operational' | 'degraded' | 'maintenance';
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function StatusIndicator({
  systemStatus = 'operational',
  isRefreshing,
  onRefresh
}: StatusIndicatorProps) {
  const {
    totalUsers,
    offlineUsers,
    isLoading
  } = useOfflineUsersCount();

  // Get the appropriate status color based on system status
  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return <div className="flex items-center space-x-4">
      {/* User Status Summary */}
      <div className="flex items-center">
        {isLoading ? <span className="text-sm text-gray-500">Chargement des utilisateurs...</span> : <span className="text-sm text-gray-700">
            {offlineUsers} / {totalUsers} déconnectés
          </span>}
      </div>
      
      {/* Refresh Button */}
      <button onClick={onRefresh} disabled={isRefreshing} className={`flex items-center text-sm text-gray-700 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:text-bgs-blue'}`}>
        <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
      </button>
    </div>;
}

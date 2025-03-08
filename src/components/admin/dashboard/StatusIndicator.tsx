
import React from 'react';
import { RefreshCcw, WifiOff, Wifi } from 'lucide-react';
import { useOfflineUsersCount } from '@/hooks/admin/useOfflineUsersCount';

export interface StatusIndicatorProps {
  systemStatus?: 'operational' | 'degraded' | 'maintenance';
  realTimeStatus?: 'connected' | 'connecting' | 'error';
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function StatusIndicator({ 
  systemStatus = 'operational', 
  realTimeStatus,
  isRefreshing,
  onRefresh 
}: StatusIndicatorProps) {
  const { totalUsers, offlineUsers, isLoading } = useOfflineUsersCount();
  
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

  // Get the appropriate status color based on real-time status
  const getRealTimeStatusColor = () => {
    switch (realTimeStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* System Status Indicator */}
      <div className="flex items-center">
        <div className={`h-2.5 w-2.5 rounded-full ${getSystemStatusColor()} mr-2`}></div>
        <span className="text-sm text-gray-700">
          {systemStatus === 'operational' ? 'Système opérationnel' :
           systemStatus === 'degraded' ? 'Performance dégradée' :
           systemStatus === 'maintenance' ? 'Maintenance en cours' : 'État inconnu'}
        </span>
      </div>
      
      {/* User Status Summary - New addition */}
      {!isLoading && (
        <div className="flex items-center border-l border-gray-200 pl-4 ml-2">
          <span className="text-sm text-gray-700">
            {offlineUsers} / {totalUsers} déconnectés
          </span>
        </div>
      )}
      
      {/* Real-time Status Indicator - Only show if realTimeStatus is provided */}
      {realTimeStatus && (
        <div className="flex items-center">
          {realTimeStatus === 'connected' ? (
            <Wifi className="h-4 w-4 text-green-500 mr-1" />
          ) : realTimeStatus === 'connecting' ? (
            <Wifi className="h-4 w-4 text-yellow-500 mr-1" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className="text-sm text-gray-700">
            {realTimeStatus === 'connected' ? 'Temps réel actif' :
             realTimeStatus === 'connecting' ? 'Connexion en cours...' : 
             'Déconnecté'}
          </span>
        </div>
      )}
      
      {/* Refresh Button */}
      <button 
        onClick={onRefresh}
        disabled={isRefreshing}
        className={`flex items-center text-sm text-gray-700 ${isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:text-bgs-blue'}`}
      >
        <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Actualisation...' : 'Actualiser'}
      </button>
    </div>
  );
}


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
  // Afficher le statut approprié en fonction des props
  const displayStatus = realTimeStatus ? realTimeStatus : systemStatus;
  
  // Déterminer la couleur et le texte en fonction du statut
  let statusColor = 'bg-green-500';
  let statusText = 'Système opérationnel';
  
  if (realTimeStatus) {
    // Si on affiche le statut temps réel
    if (realTimeStatus === 'connected') {
      statusColor = 'bg-green-500';
      statusText = 'Connecté en temps réel';
    } else if (realTimeStatus === 'connecting') {
      statusColor = 'bg-yellow-500';
      statusText = 'Connexion en cours...';
    } else {
      statusColor = 'bg-red-500';
      statusText = 'Déconnecté';
    }
  } else {
    // Si on affiche le statut système
    if (systemStatus === 'operational') {
      statusColor = 'bg-green-500';
      statusText = 'Système opérationnel';
    } else if (systemStatus === 'degraded') {
      statusColor = 'bg-yellow-500';
      statusText = 'Performance dégradée';
    } else {
      statusColor = 'bg-red-500';
      statusText = 'Maintenance en cours';
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center">
        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${statusColor} animate-pulse`}></div>
        <span className="text-sm font-medium text-gray-700 mr-3">
          {statusText}
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

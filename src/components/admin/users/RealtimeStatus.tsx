
import React from 'react';

interface RealtimeStatusProps {
  status: 'connecting' | 'connected' | 'error';
}

const RealtimeStatus = ({ status }: RealtimeStatusProps) => {
  return (
    <div className="mb-4 flex items-center">
      <div className={`h-2 w-2 rounded-full mr-2 animate-pulse ${
        status === 'connected' ? 'bg-green-500' : 
        status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
      }`}></div>
      <span className="text-sm text-gray-600">
        {status === 'connected' ? 'Mise à jour en temps réel active' : 
         status === 'error' ? 'Erreur de connexion en temps réel' : 'Connexion en cours...'}
      </span>
    </div>
  );
};

export default RealtimeStatus;

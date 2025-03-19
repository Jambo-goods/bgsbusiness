
import React from "react";
import { AlertTriangle, Check } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  hasMisspelledStatus: boolean;
  isProcessed: boolean;
}

export function StatusBadge({ status, hasMisspelledStatus, isProcessed }: StatusBadgeProps) {
  // Determine status color based on status
  const getStatusBg = (status: string): string => {
    if (status === 'received' || status === 'reçu') return 'bg-green-100 text-green-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'receveid') return 'bg-orange-100 text-orange-800 border border-orange-300'; // Handle misspelled status
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBg(status)}`}>
        {status}
      </span>
      
      {hasMisspelledStatus && (
        <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-amber-300">
          <AlertTriangle className="h-3 w-3" />
          <span>Erreur de statut</span>
        </div>
      )}
      
      {isProcessed && (
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Check className="h-3 w-3" />
          <span>Traité</span>
        </div>
      )}
    </div>
  );
}

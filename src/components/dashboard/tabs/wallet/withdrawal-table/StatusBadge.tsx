
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { label: 'En attente', variant: 'outline', class: 'border-yellow-300 text-yellow-700 bg-yellow-50' };
      case 'processing':
        return { label: 'En traitement', variant: 'outline', class: 'border-blue-300 text-blue-700 bg-blue-50' };
      case 'approved':
        return { label: 'Approuvée', variant: 'outline', class: 'border-green-300 text-green-700 bg-green-50' };
      case 'scheduled':
      case 'sheduled': // Handle typo in status
        return { label: 'Programmée', variant: 'outline', class: 'border-purple-300 text-purple-700 bg-purple-50' };
      case 'completed':
        return { label: 'Complétée', variant: 'outline', class: 'border-green-300 text-green-700 bg-green-50' };
      case 'rejected':
        return { label: 'Rejetée', variant: 'outline', class: 'border-red-300 text-red-700 bg-red-50' };
      case 'paid':
        return { label: 'Payée', variant: 'outline', class: 'border-green-300 text-green-700 bg-green-50' };
      case 'cancelled':
        return { label: 'Annulée', variant: 'outline', class: 'border-gray-300 text-gray-700 bg-gray-50' };
      case 'received':
        return { label: 'Reçue', variant: 'outline', class: 'border-blue-300 text-blue-700 bg-blue-50' };
      default:
        return { label: status || 'Inconnu', variant: 'outline', class: 'border-gray-300 text-gray-700 bg-gray-50' };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={config.class}>
      {config.label}
    </Badge>
  );
}

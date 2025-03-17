
import React from "react";

interface BankTransferStatusBadgeProps {
  status: string | null;
}

export default function BankTransferStatusBadge({ status }: BankTransferStatusBadgeProps) {
  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'received':
      case 'reçu':
        return 'Reçu';
      case 'processed':
        return 'Traité';
      case 'confirmed':
        return 'Confirmé';
      case 'rejected':
        return 'Rejeté';
      default:
        return status || 'Inconnu';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'received':
      case 'reçu':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}

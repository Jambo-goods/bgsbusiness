
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-amber-500">En attente</Badge>;
    case 'valid':
      return <Badge className="bg-blue-500">Valide</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-500">Annulé</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default StatusBadge;

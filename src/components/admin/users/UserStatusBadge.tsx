
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserX } from 'lucide-react';

interface UserStatusBadgeProps {
  status: 'online' | 'offline';
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <Badge 
      variant="secondary"
      className={`flex items-center gap-1 ${
        status === 'online' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      <UserX className="h-3 w-3" />
      <span>{status === 'online' ? 'En ligne' : 'Hors ligne'}</span>
    </Badge>
  );
}

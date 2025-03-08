
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface UserStatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended';
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <Badge 
      variant="secondary"
      className={`flex items-center gap-1 ${
        status === 'active' 
          ? 'bg-green-100 text-green-800' 
          : status === 'inactive'
            ? 'bg-gray-200 text-gray-800'
            : 'bg-red-100 text-red-800'
      }`}
    >
      <User className="h-3 w-3" />
      <span>
        {status === 'active' 
          ? 'Actif' 
          : status === 'inactive' 
            ? 'Inactif' 
            : 'Suspendu'}
      </span>
    </Badge>
  );
}

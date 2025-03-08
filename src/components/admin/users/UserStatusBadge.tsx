
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, UserCheck, UserX } from 'lucide-react';

interface UserStatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended' | 'online' | 'offline';
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  // Display badges for different user statuses
  if (status === 'online' || status === 'offline') {
    return (
      <Badge 
        variant="secondary"
        className={`flex items-center gap-1 ${
          status === 'online' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        {status === 'online' ? (
          <>
            <UserCheck className="h-3 w-3" />
            <span>En ligne</span>
          </>
        ) : (
          <>
            <UserX className="h-3 w-3" />
            <span>Hors ligne</span>
          </>
        )}
      </Badge>
    );
  }

  // Account status badges (active, inactive, suspended)
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

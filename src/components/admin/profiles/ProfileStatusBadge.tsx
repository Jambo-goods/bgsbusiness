
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { calculateInactivityTime } from '@/utils/inactivityCalculator';

interface ProfileStatusBadgeProps {
  lastActive: string | null;
  createdAt: string | null;
  onlineStatus?: 'online' | 'offline';
}

export default function ProfileStatusBadge({ lastActive, createdAt, onlineStatus }: ProfileStatusBadgeProps) {
  const inactiveTime = calculateInactivityTime(lastActive, createdAt);
  
  return (
    <Badge 
      variant="secondary"
      className={`flex items-center gap-1 ${
        onlineStatus === 'online' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      <User className="h-3 w-3" />
      <span>{onlineStatus === 'online' ? 'En ligne' : `Inactif depuis ${inactiveTime}`}</span>
    </Badge>
  );
}


import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';

interface ProfilesHeaderProps {
  totalCount: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ProfilesHeader({ totalCount, isLoading, onRefresh }: ProfilesHeaderProps) {
  return (
    <CardTitle className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-gray-500" />
        <span>Liste de tous les profils ({totalCount})</span>
      </div>
      <Button 
        variant="outline"
        onClick={onRefresh}
        className="flex items-center gap-2"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
    </CardTitle>
  );
}


import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UsersSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  userCount: number;
}

export default function UsersSearchBar({
  searchTerm,
  setSearchTerm,
  onRefresh,
  isRefreshing,
  userCount
}: UsersSearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="pl-10 w-full md:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="text-xs text-gray-500 absolute left-3 -bottom-5">
          {userCount} utilisateur{userCount > 1 ? 's' : ''} trouvé{userCount > 1 ? 's' : ''}
        </span>
      </div>
      
      <Button
        onClick={onRefresh}
        className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
        disabled={isRefreshing}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Actualiser
      </Button>
    </div>
  );
}

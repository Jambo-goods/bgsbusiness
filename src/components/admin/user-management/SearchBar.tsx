
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resultsCount: number;
}

export const SearchBar = ({ searchTerm, setSearchTerm, resultsCount }: SearchBarProps) => {
  return (
    <div className="flex items-center mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="ml-2 text-sm text-gray-500">
        {resultsCount} compte{resultsCount > 1 ? 's' : ''} trouvé{resultsCount > 1 ? 's' : ''}
      </div>
    </div>
  );
};

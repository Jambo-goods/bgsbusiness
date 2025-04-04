
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProfileSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function ProfileSearch({ searchTerm, setSearchTerm }: ProfileSearchProps) {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input 
          type="text" 
          placeholder="Rechercher par nom, email, téléphone..." 
          className="pl-10 w-full" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>
    </div>
  );
}

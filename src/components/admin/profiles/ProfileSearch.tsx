
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProfileSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function ProfileSearch({ searchTerm, setSearchTerm }: ProfileSearchProps) {
  console.log('ProfileSearch - Current searchTerm:', searchTerm);
  
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input 
        type="text" 
        placeholder="Rechercher par nom, email..." 
        className="pl-10 w-full" 
        value={searchTerm} 
        onChange={e => {
          const newValue = e.target.value;
          console.log('Setting new searchTerm:', newValue);
          setSearchTerm(newValue);
        }} 
      />
    </div>
  );
}

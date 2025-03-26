
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProfileSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const ProfileSearch: React.FC<ProfileSearchProps> = ({ searchTerm, setSearchTerm }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder="Rechercher par nom, email..."
        value={searchTerm}
        onChange={handleChange}
        className="pl-10 w-full max-w-md"
      />
    </div>
  );
};

export default ProfileSearch;

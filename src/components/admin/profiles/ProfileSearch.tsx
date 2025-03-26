
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProfileSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProfileSearch: React.FC<ProfileSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        type="text"
        placeholder="Rechercher par nom, prénom ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default ProfileSearch;

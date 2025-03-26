
import React from 'react';
import { Input } from '@/components/ui/input';

interface ProfileSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const ProfileSearch: React.FC<ProfileSearchProps> = ({ searchTerm, setSearchTerm }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Input
      type="text"
      placeholder="Rechercher par nom, email..."
      value={searchTerm}
      onChange={handleChange}
      className="pl-10 w-full max-w-md"
    />
  );
};

export default ProfileSearch;

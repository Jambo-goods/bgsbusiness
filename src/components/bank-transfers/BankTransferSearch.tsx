
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BankTransferSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function BankTransferSearch({ searchTerm, setSearchTerm }: BankTransferSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input 
        type="text" 
        placeholder="Rechercher par utilisateur, référence..." 
        className="pl-10 w-full md:w-80" 
        value={searchTerm} 
        onChange={e => setSearchTerm(e.target.value)} 
      />
    </div>
  );
}

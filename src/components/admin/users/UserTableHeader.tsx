
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserTableHeaderProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
}

const UserTableHeader = ({ sortField, sortDirection, handleSort }: UserTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[250px]">
          <button 
            className="flex items-center space-x-1 hover:text-bgs-blue"
            onClick={() => handleSort('first_name')}
          >
            <span>Nom</span>
            {sortField === 'first_name' && (
              sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </TableHead>
        <TableHead>Email</TableHead>
        <TableHead>
          <button 
            className="flex items-center space-x-1 hover:text-bgs-blue"
            onClick={() => handleSort('wallet_balance')}
          >
            <span>Solde</span>
            {sortField === 'wallet_balance' && (
              sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </TableHead>
        <TableHead>
          <button 
            className="flex items-center space-x-1 hover:text-bgs-blue"
            onClick={() => handleSort('investment_total')}
          >
            <span>Investissements</span>
            {sortField === 'investment_total' && (
              sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </TableHead>
        <TableHead>
          <button 
            className="flex items-center space-x-1 hover:text-bgs-blue"
            onClick={() => handleSort('created_at')}
          >
            <span>Date d'inscription</span>
            {sortField === 'created_at' && (
              sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
            )}
          </button>
        </TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UserTableHeader;


import React from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpDown } from 'lucide-react';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  wallet_balance: number | null;
  investment_total: number | null;
  created_at: string | null;
  [key: string]: any;
}

interface UserTableProps {
  users: User[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onAddFunds: (user: User) => void;
}

export const UserTable = ({ 
  users, 
  sortField, 
  sortDirection, 
  onSort, 
  onAddFunds 
}: UserTableProps) => {
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">
              <button 
                className="flex items-center font-semibold"
                onClick={() => onSort('first_name')}
              >
                Nom
                {sortField === 'first_name' && (
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>
              <button 
                className="flex items-center font-semibold"
                onClick={() => onSort('wallet_balance')}
              >
                Solde du compte
                {sortField === 'wallet_balance' && (
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center font-semibold"
                onClick={() => onSort('investment_total')}
              >
                Total investi
                {sortField === 'investment_total' && (
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center font-semibold"
                onClick={() => onSort('created_at')}
              >
                Date d'inscription
                {sortField === 'created_at' && (
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.first_name || 'Sans nom'} {user.last_name || ''}
              </TableCell>
              <TableCell>{user.email || 'Email non disponible'}</TableCell>
              <TableCell>{user.wallet_balance?.toLocaleString() || 0} €</TableCell>
              <TableCell>{user.investment_total?.toLocaleString() || 0} €</TableCell>
              <TableCell>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddFunds(user)}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Ajouter des fonds
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

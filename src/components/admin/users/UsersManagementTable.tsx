
import React from 'react';
import { ArrowUp, ArrowDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { User } from '@/hooks/useUserManagement';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UsersManagementTableProps {
  users: User[];
  sortConfig: {
    field: string;
    direction: 'asc' | 'desc';
  };
  onSort: (field: string) => void;
  onAddFunds: (user: User) => void;
}

export const UsersManagementTable: React.FC<UsersManagementTableProps> = ({ 
  users, 
  sortConfig,
  onSort, 
  onAddFunds 
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Aucun utilisateur ne correspond à votre recherche
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <button 
                className="flex items-center space-x-1 hover:text-bgs-blue"
                onClick={() => onSort('first_name')}
              >
                <span>Nom</span>
                {sortConfig.field === 'first_name' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>
              <button 
                className="flex items-center space-x-1 hover:text-bgs-blue"
                onClick={() => onSort('wallet_balance')}
              >
                <span>Solde</span>
                {sortConfig.field === 'wallet_balance' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center space-x-1 hover:text-bgs-blue"
                onClick={() => onSort('investment_total')}
              >
                <span>Investissements</span>
                {sortConfig.field === 'investment_total' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center space-x-1 hover:text-bgs-blue"
                onClick={() => onSort('created_at')}
              >
                <span>Date d'inscription</span>
                {sortConfig.field === 'created_at' && (
                  sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
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
              <TableCell>{user.wallet_balance?.toLocaleString('fr-FR') || 0} €</TableCell>
              <TableCell>{user.investment_total?.toLocaleString('fr-FR') || 0} €</TableCell>
              <TableCell>
                {user.created_at ? formatDate(user.created_at) : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddFunds(user)}
                  title="Ajouter des fonds"
                >
                  <Wallet className="h-4 w-4 mr-2" />
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

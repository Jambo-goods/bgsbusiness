
import React from 'react';
import { ArrowUp, ArrowDown, Wallet, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { toast } from 'sonner';

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface UsersTableProps {
  users: any[];
  sortConfig: SortConfig;
  onSort: (field: string) => void;
  onAddFunds: (user: any) => void;
}

export default function UsersTable({ 
  users, 
  sortConfig,
  onSort, 
  onAddFunds 
}: UsersTableProps) {
  // Si aucun utilisateur n'est trouvé après le filtrage
  if (users.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Aucun utilisateur ne correspond à votre recherche
      </div>
    );
  }

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
              <TableCell className="font-medium">{user.first_name || 'Sans nom'} {user.last_name || ''}</TableCell>
              <TableCell>{user.email || 'Email non disponible'}</TableCell>
              <TableCell>{user.wallet_balance?.toLocaleString() || 0} €</TableCell>
              <TableCell>{user.investment_total?.toLocaleString() || 0} €</TableCell>
              <TableCell>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddFunds(user)}
                    title="Ajouter des fonds"
                  >
                    <Wallet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // View user details
                      console.log("View user details:", user);
                      toast.info(`Détails pour ${user.first_name || 'Utilisateur'} ${user.last_name || ''}`, {
                        description: "Cette fonctionnalité sera disponible prochainement."
                      });
                    }}
                    title="Voir les détails"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

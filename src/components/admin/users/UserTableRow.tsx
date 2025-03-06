
import React from 'react';
import { Wallet, Pencil } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UserTableRowProps {
  user: any;
  onAddFunds: (user: any) => void;
}

const UserTableRow = ({ user, onAddFunds }: UserTableRowProps) => {
  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
      <TableCell>{user.email}</TableCell>
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
              toast.info(`Détails pour ${user.first_name} ${user.last_name}`, {
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
  );
};

export default UserTableRow;


import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Profile } from '@/hooks/useAllProfiles';

interface UsersTableProps {
  users: Profile[];
  isLoading: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex space-x-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Prénom</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Portefeuille</TableHead>
          <TableHead>Projets</TableHead>
          <TableHead>Total investi</TableHead>
          <TableHead>Date d'inscription</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              Aucun utilisateur disponible
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.first_name || '-'}</TableCell>
              <TableCell>{user.last_name || '-'}</TableCell>
              <TableCell>{user.email || '-'}</TableCell>
              <TableCell>{user.phone || '-'}</TableCell>
              <TableCell>{user.wallet_balance ? `${user.wallet_balance} €` : '0 €'}</TableCell>
              <TableCell>{user.projects_count || 0}</TableCell>
              <TableCell>{user.investment_total ? `${user.investment_total} €` : '0 €'}</TableCell>
              <TableCell>
                {user.created_at ? format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr }) : '-'}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

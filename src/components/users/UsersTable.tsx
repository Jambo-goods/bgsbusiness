
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
import { User } from '@/hooks/useUsersList';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  editingUser: string | null;
  editedValues: Partial<User>;
  onEdit: (userId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => Promise<void>;
  onChangeEditedValue: (field: string, value: string | number) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  isLoading, 
  editingUser,
  editedValues,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeEditedValue
}) => {
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
          <TableHead>Adresse</TableHead>
          <TableHead>Portefeuille</TableHead>
          <TableHead>Projets</TableHead>
          <TableHead>Total investi</TableHead>
          <TableHead>Date d'inscription</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
              Aucun utilisateur disponible
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {editingUser === user.id ? (
                  <Input
                    value={editedValues.first_name ?? user.first_name ?? ''}
                    onChange={(e) => onChangeEditedValue('first_name', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  user.first_name || '-'
                )}
              </TableCell>
              <TableCell>
                {editingUser === user.id ? (
                  <Input
                    value={editedValues.last_name ?? user.last_name ?? ''}
                    onChange={(e) => onChangeEditedValue('last_name', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  user.last_name || '-'
                )}
              </TableCell>
              <TableCell>
                {editingUser === user.id ? (
                  <Input
                    value={editedValues.email ?? user.email ?? ''}
                    onChange={(e) => onChangeEditedValue('email', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  user.email || '-'
                )}
              </TableCell>
              <TableCell>
                {editingUser === user.id ? (
                  <Input
                    value={editedValues.phone ?? user.phone ?? ''}
                    onChange={(e) => onChangeEditedValue('phone', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  user.phone || '-'
                )}
              </TableCell>
              <TableCell>
                {editingUser === user.id ? (
                  <Input
                    value={editedValues.address ?? user.address ?? ''}
                    onChange={(e) => onChangeEditedValue('address', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  user.address || '-'
                )}
              </TableCell>
              <TableCell>{user.wallet_balance ? `${user.wallet_balance} €` : '0 €'}</TableCell>
              <TableCell>{user.projects_count || 0}</TableCell>
              <TableCell>{user.investment_total ? `${user.investment_total} €` : '0 €'}</TableCell>
              <TableCell>
                {user.created_at ? format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr }) : '-'}
              </TableCell>
              <TableCell>
                {editingUser === user.id ? (
                  <div className="flex space-x-2">
                    <Button 
                      onClick={onSaveEdit} 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={onCancelEdit} 
                      size="sm"
                      variant="destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => onEdit(user.id)}
                    size="sm"
                    className="bg-bgs-blue hover:bg-bgs-blue-light"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UsersTable;

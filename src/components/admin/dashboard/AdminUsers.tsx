
import React, { useEffect } from 'react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminUsers: React.FC = () => {
  const { adminUsers, isLoading, fetchAdminUsers, removeAdmin } = useAdminUsers();

  useEffect(() => {
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mt-8">
      <h2 className="text-xl font-semibold mb-4">Utilisateurs du système</h2>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
        </div>
      ) : adminUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun utilisateur trouvé
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.created_at 
                    ? format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr })
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAdmin(user.id)}
                    title="Supprimer cet utilisateur"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminUsers;


import React, { useEffect } from 'react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { Button } from '@/components/ui/button';
import { Trash2, User, ArrowUpRight } from 'lucide-react';
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
import { Link } from 'react-router-dom';

const AdminUsers: React.FC = () => {
  const { adminUsers, isLoading, fetchAdminUsers, removeAdmin } = useAdminUsers();

  useEffect(() => {
    console.log("AdminUsers component - Fetching users...");
    fetchAdminUsers();
  }, [fetchAdminUsers]);

  console.log("AdminUsers component - adminUsers count:", adminUsers.length);

  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Utilisateurs récents ({adminUsers.length})</h2>
        <Link to="/admin/users">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <span>Voir tous</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
        </div>
      ) : adminUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun utilisateur trouvé
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Solde</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.slice(0, 5).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name || ''} {user.last_name || ''}
                    {(!user.first_name && !user.last_name) && 'Utilisateur sans nom'}
                  </TableCell>
                  <TableCell>{user.email || 'Pas d\'email'}</TableCell>
                  <TableCell>{user.phone || 'Non renseigné'}</TableCell>
                  <TableCell>{user.wallet_balance !== null ? `${user.wallet_balance} €` : '0 €'}</TableCell>
                  <TableCell>
                    {user.created_at 
                      ? format(new Date(user.created_at), 'dd MMMM yyyy', { locale: fr })
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log("View user details", user.id)}
                        title="Voir les détails"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAdmin(user.id)}
                        title="Supprimer cet utilisateur"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

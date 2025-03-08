
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, AlertCircle } from 'lucide-react';
import { 
  Table, TableBody, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function UsersTable({ users, onSelectUser }) {
  const isUserActive = (lastActive) => {
    if (!lastActive) return false;
    
    const lastActiveDate = new Date(lastActive);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return lastActiveDate > thirtyDaysAgo;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (error) {
      console.error("Invalid date:", dateString);
      return 'Date invalide';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Solde</TableHead>
            <TableHead>Investissements</TableHead>
            <TableHead>Dernière Connexion</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">Aucun utilisateur trouvé</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {user.wallet_balance?.toLocaleString() || 0} €
                </TableCell>
                <TableCell>
                  {user.investments?.length || 0} projets
                </TableCell>
                <TableCell>
                  {formatDate(user.last_active_at)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isUserActive(user.last_active_at) ? "success" : "destructive"}
                  >
                    {isUserActive(user.last_active_at) ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectUser(user)}
                    className="gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

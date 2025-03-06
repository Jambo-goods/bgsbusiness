
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Table, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import UserTableHeader from './UserTableHeader';
import UserTableRow from './UserTableRow';
import { UserPlus } from 'lucide-react';

interface UserTableProps {
  users: any[];
  filteredUsers: any[];
  isLoading: boolean;
  hasError: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  fetchUsers: () => void;
  onAddFunds: (user: any) => void;
  onCreateUser: () => void;
  searchTerm: string;
}

const UserTable = ({ 
  users, 
  filteredUsers, 
  isLoading, 
  hasError, 
  sortField, 
  sortDirection, 
  handleSort, 
  fetchUsers, 
  onAddFunds, 
  onCreateUser,
  searchTerm 
}: UserTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-bgs-blue" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center p-8 text-red-500">
        Une erreur est survenue lors du chargement des utilisateurs. 
        <Button 
          variant="link" 
          onClick={fetchUsers} 
          className="text-bgs-blue"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Aucun utilisateur trouvé dans la base de données.
        <div className="mt-4">
          <Button
            onClick={onCreateUser}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Créer un premier utilisateur test
          </Button>
        </div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Aucun utilisateur ne correspond à votre recherche
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <UserTableHeader 
          sortField={sortField} 
          sortDirection={sortDirection} 
          handleSort={handleSort} 
        />
        <TableBody>
          {filteredUsers.map((user) => (
            <UserTableRow 
              key={user.id} 
              user={user} 
              onAddFunds={onAddFunds} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;

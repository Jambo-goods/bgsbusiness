
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUserManagement, User } from '@/hooks/useUserManagement';
import { UserSearchBar } from '@/components/admin/users/UserSearchBar';
import { UsersManagementTable } from '@/components/admin/users/UsersManagementTable';
import { AddFundsDialog } from '@/components/admin/users/AddFundsDialog';

export default function UserManagement() {
  const {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    fetchUsers,
    addFundsToUser
  } = useUserManagement();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddFundsDialogOpen, setIsAddFundsDialogOpen] = useState(false);

  const handleAddFunds = (user: User) => {
    setSelectedUser(user);
    setIsAddFundsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
        
        <UserSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={fetchUsers}
          isLoading={isLoading}
          userCount={users.length}
        />
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
          </div>
        ) : (
          <UsersManagementTable
            users={users}
            sortConfig={sortConfig}
            onSort={handleSort}
            onAddFunds={handleAddFunds}
          />
        )}
        
        {selectedUser && (
          <AddFundsDialog
            isOpen={isAddFundsDialogOpen}
            onOpenChange={setIsAddFundsDialogOpen}
            userId={selectedUser.id}
            userName={`${selectedUser.first_name || 'Utilisateur'} ${selectedUser.last_name || ''}`}
            currentBalance={selectedUser.wallet_balance || 0}
            onAddFunds={addFundsToUser}
          />
        )}
      </div>
    </AdminLayout>
  );
}

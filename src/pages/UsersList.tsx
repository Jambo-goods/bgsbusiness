
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useUsersList } from '@/hooks/useUsersList';
import UsersSearchBar from '@/components/users/UsersSearchBar';
import UsersTable from '@/components/users/UsersTable';

const UsersList: React.FC = () => {
  const {
    filteredUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    isRefreshing,
    handleRefresh,
    totalUsers,
    editingUser,
    editedValues,
    handleEditUser,
    handleCancelEdit,
    handleSaveEdit,
    handleChangeEditedValue
  } = useUsersList();

  return (
    <>
      <Helmet>
        <title>Liste des utilisateurs | BGS Invest</title>
        <meta name="description" content="Voir la liste de tous les utilisateurs de BGS Invest" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Gestion des utilisateurs</h1>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
              <UsersSearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                userCount={filteredUsers.length}
              />
              
              <div className="overflow-x-auto mt-6">
                <UsersTable 
                  users={filteredUsers} 
                  isLoading={isLoading}
                  editingUser={editingUser}
                  editedValues={editedValues}
                  onEdit={handleEditUser}
                  onCancelEdit={handleCancelEdit}
                  onSaveEdit={handleSaveEdit}
                  onChangeEditedValue={handleChangeEditedValue}
                />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default UsersList;

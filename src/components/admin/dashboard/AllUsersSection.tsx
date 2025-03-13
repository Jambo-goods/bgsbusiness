
import React, { useEffect } from 'react';
import UsersTable from './UsersTable';
import { useAllUsersData } from '@/hooks/admin/useAllUsersData';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const AllUsersSection: React.FC = () => {
  const { users, isLoading, totalUsers, refreshUsers } = useAllUsersData();

  useEffect(() => {
    // Initial fetch when component mounts
    refreshUsers();
  }, [refreshUsers]);

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          Tous les utilisateurs 
          <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
            {totalUsers}
          </span>
        </h2>
        <Button 
          onClick={refreshUsers} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <UsersTable users={users} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AllUsersSection;

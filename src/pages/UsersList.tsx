
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/users/UsersTable";
import { UsersSearchBar } from "@/components/users/UsersSearchBar";
import { useUsersList } from "@/hooks/useUsersList";

export default function UsersList() {
  const {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    fetchUsers,
    editingUserId,
    setEditingUserId,
    editValues,
    setEditValues,
    handleSaveEdit
  } = useUsersList();

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="bg-background rounded-lg border shadow-sm p-6">
          <div className="mb-4">
            <UsersSearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>

          <UsersTable
            users={users}
            isLoading={isLoading}
            onRefresh={fetchUsers}
            editingUserId={editingUserId}
            setEditingUserId={setEditingUserId}
            handleSaveEdit={handleSaveEdit}
            editValues={editValues}
            setEditValues={setEditValues}
          />
        </div>
      </div>
    </div>
  );
}

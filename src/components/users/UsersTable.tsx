
import React, { useState } from "react";
import { MoreHorizontal, User, Wallet, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddInvestmentModal } from "./AddInvestmentModal";

interface UsersTableProps {
  users: any[];
  isLoading: boolean;
  onRefresh: () => void;
  editingUserId: string | null;
  setEditingUserId: (id: string | null) => void;
  handleSaveEdit: (userId: string, field: string, value: string) => Promise<void>;
  editValues: Record<string, any>;
  setEditValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export function UsersTable({
  users,
  isLoading,
  onRefresh,
  editingUserId,
  setEditingUserId,
  handleSaveEdit,
  editValues,
  setEditValues,
}: UsersTableProps) {
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleEditClick = (userId: string, field: string, currentValue: string) => {
    setEditingUserId(userId);
    setEditValues({
      ...editValues,
      [field]: currentValue,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setEditValues({
      ...editValues,
      [field]: value,
    });
  };

  const handleAddInvestment = (userId: string) => {
    setSelectedUserId(userId);
    setInvestmentModalOpen(true);
  };

  return (
    <div className="border rounded-md">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium">User</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Email</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Phone</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Balance</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Investments</th>
              <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
              >
                <td className="p-4 align-middle">
                  {editingUserId === user.id && editValues.hasOwnProperty("first_name") ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={editValues.first_name || ""}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        className="border rounded p-1 text-sm w-20"
                      />
                      <input
                        type="text"
                        value={editValues.last_name || ""}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        className="border rounded p-1 text-sm w-20"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveEdit(user.id, "name", "")}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() =>
                        handleEditClick(
                          user.id,
                          "first_name",
                          user.first_name
                        )
                      }
                    >
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle">
                  {editingUserId === user.id && editValues.hasOwnProperty("email") ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={editValues.email || ""}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="border rounded p-1 text-sm w-40"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveEdit(user.id, "email", editValues.email)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        handleEditClick(user.id, "email", user.email)
                      }
                    >
                      {user.email}
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle">
                  {editingUserId === user.id && editValues.hasOwnProperty("phone") ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={editValues.phone || ""}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="border rounded p-1 text-sm w-32"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveEdit(user.id, "phone", editValues.phone)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        handleEditClick(user.id, "phone", user.phone || "")
                      }
                    >
                      {user.phone || "No phone"}
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle">
                  {editingUserId === user.id && editValues.hasOwnProperty("wallet_balance") ? (
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={editValues.wallet_balance || 0}
                        onChange={(e) => handleInputChange("wallet_balance", e.target.value)}
                        className="border rounded p-1 text-sm w-24"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveEdit(user.id, "wallet_balance", editValues.wallet_balance)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() =>
                        handleEditClick(
                          user.id,
                          "wallet_balance",
                          user.wallet_balance?.toString() || "0"
                        )
                      }
                    >
                      <Wallet className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{user.wallet_balance || 0}€</span>
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.projects_count || 0} projects</span>
                  </div>
                </td>
                <td className="p-4 align-middle text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleAddInvestment(user.id)}>
                        Add Investment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {users.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedUserId && (
        <AddInvestmentModal 
          userId={selectedUserId}
          isOpen={investmentModalOpen}
          onOpenChange={setInvestmentModalOpen}
          onInvestmentAdded={onRefresh}
        />
      )}
    </div>
  );
}

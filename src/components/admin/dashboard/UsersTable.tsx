
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, UserPlus } from "lucide-react";
import { useAllUsersData } from "@/hooks/admin/useAllUsersData";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const UsersTable = () => {
  const { users, loading } = useAllUsersData();
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Sort users
  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    // Handle different data types
    if (sortColumn === "created_at" || sortColumn === "last_sign_in_at") {
      const aDate = new Date(aValue || 0).getTime();
      const bDate = new Date(bValue || 0).getTime();
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    }
    
    // String comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Number comparison
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium">Utilisateurs</h3>
        <Button onClick={() => navigate("/admin/users/create")} size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort("full_name")}
              >
                Nom
                {sortColumn === "full_name" && (
                  <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort("email")}
              >
                Email
                {sortColumn === "email" && (
                  <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort("created_at")}
              >
                Inscrit
                {sortColumn === "created_at" && (
                  <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => toggleSort("wallet_balance")}
              >
                Solde
                {sortColumn === "wallet_balance" && (
                  <span className="ml-1">{sortDirection === "asc" ? "▲" : "▼"}</span>
                )}
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.slice(0, 5).map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || "Non spécifié"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.created_at 
                    ? new Date(user.created_at).toLocaleDateString() 
                    : "Non spécifié"}
                </TableCell>
                <TableCell className="text-right">
                  {typeof user.wallet_balance === "number" 
                    ? `${user.wallet_balance.toFixed(2)} €` 
                    : "0.00 €"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {users.length > 5 && (
        <div className="flex justify-center p-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/admin/users")}
          >
            Voir tous les utilisateurs
          </Button>
        </div>
      )}
    </div>
  );
};

export default UsersTable;

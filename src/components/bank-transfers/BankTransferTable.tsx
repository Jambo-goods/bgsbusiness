
import React from "react";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { BankTransfer, UserData } from "./types";
import BankTransferTableRow from "./BankTransferTableRow";

interface BankTransferTableProps {
  isLoading: boolean;
  filteredTransfers: BankTransfer[];
  userData: Record<string, UserData>;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
}

export default function BankTransferTable({
  isLoading,
  filteredTransfers,
  userData,
  sortField,
  sortDirection,
  handleSort
}: BankTransferTableProps) {
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const handleHeaderClick = (field: string) => {
    handleSort(field);
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin w-8 h-8 border-t-2 border-bgs-blue rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement des virements bancaires...</p>
      </div>
    );
  }

  if (filteredTransfers.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Aucun virement bancaire trouvé.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="w-[250px] cursor-pointer"
              onClick={() => handleHeaderClick("user")}
            >
              Utilisateur {renderSortIndicator("user")}
            </TableHead>
            <TableHead>Référence</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick("amount")}
            >
              Montant {renderSortIndicator("amount")}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick("date")}
            >
              Date {renderSortIndicator("date")}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleHeaderClick("status")}
            >
              Statut {renderSortIndicator("status")}
            </TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransfers.map(transfer => (
            <BankTransferTableRow 
              key={transfer.id}
              transfer={transfer} 
              userData={userData[transfer.user_id]} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

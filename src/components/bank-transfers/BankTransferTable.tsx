
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import BankTransferTableRow from "./BankTransferTableRow";
import { BankTransfer, UserData } from "./types";

interface BankTransferTableProps {
  isLoading: boolean;
  filteredTransfers: BankTransfer[];
  userData: Record<string, UserData>;
  sortField: string;
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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (filteredTransfers.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Aucun virement bancaire trouvé
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>
              <button 
                className="flex items-center space-x-1 hover:text-gray-700" 
                onClick={() => handleSort("reference")}
              >
                <span>Référence</span>
                {sortField === "reference" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center space-x-1 hover:text-gray-700" 
                onClick={() => handleSort("amount")}
              >
                <span>Montant</span>
                {sortField === "amount" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </TableHead>
            <TableHead>
              <button 
                className="flex items-center space-x-1 hover:text-gray-700" 
                onClick={() => handleSort("confirmed_at")}
              >
                <span>Date de Confirmation</span>
                {sortField === "confirmed_at" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </button>
            </TableHead>
            <TableHead>Statut</TableHead>
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

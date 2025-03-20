
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BankTransferItem } from "../types/bankTransfer";
import BankTransferTableRow from "../BankTransferTableRow";

interface TransferListViewProps {
  transfers: BankTransferItem[];
  processingId: string | null;
  lastUpdateTime: number;
  onStatusUpdate: () => void;
  isRefreshing: boolean;
}

export default function TransferListView({
  transfers,
  processingId,
  lastUpdateTime,
  onStatusUpdate,
  isRefreshing
}: TransferListViewProps) {
  if (!transfers || transfers.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-500">Aucun virement bancaire trouvé</p>
        <p className="text-sm text-gray-400 mt-2">Vérifiez les filtres ou rechargez la page</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((item) => (
            <BankTransferTableRow
              key={`${item.id}-${lastUpdateTime}`}
              item={item}
              processingId={processingId}
              onStatusUpdate={onStatusUpdate}
            />
          ))}
        </TableBody>
      </Table>
      {isRefreshing && (
        <div className="text-center p-2 text-xs text-gray-500">
          Actualisation en cours...
        </div>
      )}
    </div>
  );
}

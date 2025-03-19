
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BankTransferTableProps, BankTransferItem } from "./types/bankTransfer";
import BankTransferTableRow from "./BankTransferTableRow";
import { useBankTransfers } from "./hooks/useBankTransfers";

export default function BankTransferTable({ 
  pendingTransfers, 
  isLoading,
  refreshData
}: BankTransferTableProps) {
  const { processingId } = useBankTransfers();
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  console.log("Bank Transfer Table - Rendering transfers:", pendingTransfers?.length || 0);
  
  // Handle refresh after status update
  const handleStatusUpdate = () => {
    setLastUpdateTime(Date.now());
    if (refreshData) {
      setTimeout(() => {
        refreshData();
      }, 500);
    }
  };

  // Force a refresh every 10 seconds to catch any updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (refreshData) {
        refreshData();
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [refreshData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
      </div>
    );
  }

  if (!pendingTransfers || pendingTransfers.length === 0) {
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
            <TableHead>Réception</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingTransfers.map((item) => (
            <BankTransferTableRow
              key={`${item.id}-${lastUpdateTime}`}
              item={item}
              processingId={processingId}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

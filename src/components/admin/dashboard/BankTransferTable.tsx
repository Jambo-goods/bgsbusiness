
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BankTransferTableProps, BankTransferItem } from "./types/bankTransfer";
import BankTransferTableRow from "./BankTransferTableRow";
import { useBankTransfers } from "./hooks/useBankTransfers";
import { toast } from "sonner";

export default function BankTransferTable({ 
  pendingTransfers, 
  isLoading,
  refreshData
}: BankTransferTableProps) {
  const { processingId } = useBankTransfers();
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  console.log("Bank Transfer Table - Rendering transfers:", pendingTransfers?.length || 0);
  
  // Handle refresh after status update with debounce
  const handleStatusUpdate = () => {
    setLastUpdateTime(Date.now());
    if (refreshData && !isRefreshing) {
      setIsRefreshing(true);
      
      // Add a slight delay to ensure database operations have completed
      setTimeout(() => {
        refreshData();
        setIsRefreshing(false);
      }, 2000); // Increased delay for better stability
    }
  };

  // Force a refresh every 10 seconds to catch any updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (refreshData && !isRefreshing) {
        setIsRefreshing(true);
        refreshData();
        // Set timeout to ensure we set isRefreshing back to false
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
      }
    }, 15000); // Slightly longer interval to reduce load
    
    return () => clearInterval(intervalId);
  }, [refreshData, isRefreshing]);

  // Initial data load
  useEffect(() => {
    if (refreshData) {
      refreshData();
    }
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
            <TableHead>Actions</TableHead>
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
      {isRefreshing && (
        <div className="text-center p-2 text-xs text-gray-500">
          Actualisation en cours...
        </div>
      )}
    </div>
  );
}

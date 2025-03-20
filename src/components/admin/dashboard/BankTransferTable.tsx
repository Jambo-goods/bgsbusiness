
import React from "react";
import { BankTransferTableProps } from "./types/bankTransfer";
import { useBankTransfers } from "./hooks/useBankTransfers";
import { useTransferSubscriptions } from "./hooks/useTransferSubscriptions";
import { deduplicateTransfers, sortTransfersByDate } from "./utils/transferUtils";
import TransferListView from "./components/TransferListView";
import LoadingView from "./components/LoadingView";

export default function BankTransferTable({ 
  pendingTransfers, 
  isLoading,
  refreshData
}: BankTransferTableProps) {
  const { processingId } = useBankTransfers();
  const { lastUpdateTime, isRefreshing, handleStatusUpdate } = useTransferSubscriptions({ refreshData });

  console.log("Bank Transfer Table - Rendering transfers:", pendingTransfers?.length || 0);
  
  if (isLoading) {
    return <LoadingView />;
  }

  if (!pendingTransfers || pendingTransfers.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-500">Aucun virement bancaire trouvé</p>
        <p className="text-sm text-gray-400 mt-2">Vérifiez les filtres ou rechargez la page</p>
      </div>
    );
  }

  // ADVANCED DEDUPLICATION METHOD
  const dedupedTransfers = deduplicateTransfers(pendingTransfers);
  
  // Sort transfers by date, most recent first
  const sortedTransfers = sortTransfersByDate(dedupedTransfers);

  return (
    <TransferListView 
      transfers={sortedTransfers}
      processingId={processingId}
      lastUpdateTime={lastUpdateTime}
      onStatusUpdate={handleStatusUpdate}
      isRefreshing={isRefreshing}
    />
  );
}

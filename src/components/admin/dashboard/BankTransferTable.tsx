
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BankTransferItem, BankTransferTableProps } from "./bank-transfers/types";
import { BankTransferRow } from "./bank-transfers/BankTransferRow";
import { EmptyState } from "./bank-transfers/EmptyState";
import { confirmDeposit, rejectDeposit } from "./bank-transfers/bankTransferService";

export default function BankTransferTable({ 
  pendingTransfers, 
  isLoading, 
  refreshData 
}: BankTransferTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleConfirmDeposit = async (item: BankTransferItem, amount: number) => {
    setProcessingId(item.id);
    const success = await confirmDeposit(item, amount);
    if (success) refreshData();
    setProcessingId(null);
  };

  const handleRejectDeposit = async (item: BankTransferItem) => {
    setProcessingId(item.id);
    const success = await rejectDeposit(item);
    if (success) refreshData();
    setProcessingId(null);
  };

  if (isLoading || pendingTransfers.length === 0) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingTransfers.map((item) => (
            <BankTransferRow
              key={item.id}
              item={item}
              processingId={processingId}
              onConfirm={handleConfirmDeposit}
              onReject={handleRejectDeposit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

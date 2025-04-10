
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDate, maskAccountNumber } from "./formatUtils";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  bank_info: {
    accountName: string;
    bankName: string;
    accountNumber: string;
  } | Record<string, any>;
}

interface WithdrawalTableRowProps {
  request: WithdrawalRequest;
  onEdit: () => void;
}

export default function WithdrawalTableRow({ request, onEdit }: WithdrawalTableRowProps) {
  // Removing the isPending check and FixDepositButton
  
  return (
    <TableRow key={request.id}>
      <TableCell>{formatDate(request.requested_at)}</TableCell>
      <TableCell className="font-medium">{request.amount} €</TableCell>
      <TableCell>{request.bank_info?.bankName || "-"}</TableCell>
      <TableCell>{maskAccountNumber(request.bank_info?.accountNumber || "")}</TableCell>
      <TableCell><StatusBadge status={request.status} /></TableCell>
      <TableCell>{request.processed_at ? formatDate(request.processed_at) : "-"}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="h-8 w-8 p-0"
            title="Modifier la demande"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Modifier</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

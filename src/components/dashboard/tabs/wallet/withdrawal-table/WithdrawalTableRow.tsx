
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
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
}

export default function WithdrawalTableRow({ request }: WithdrawalTableRowProps) {
  return (
    <TableRow key={request.id}>
      <TableCell>{formatDate(request.requested_at)}</TableCell>
      <TableCell className="font-medium">{request.amount} €</TableCell>
      <TableCell>{request.bank_info?.bankName || "-"}</TableCell>
      <TableCell>{maskAccountNumber(request.bank_info?.accountNumber || "")}</TableCell>
      <TableCell><StatusBadge status={request.status} /></TableCell>
    </TableRow>
  );
}

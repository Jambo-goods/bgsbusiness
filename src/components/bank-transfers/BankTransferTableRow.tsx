
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils";
import BankTransferStatusBadge from "./BankTransferStatusBadge";
import { BankTransfer, UserData } from "./types";

interface BankTransferTableRowProps {
  transfer: BankTransfer;
  userData: UserData | undefined;
}

export default function BankTransferTableRow({ transfer, userData }: BankTransferTableRowProps) {
  return (
    <TableRow key={transfer.id}>
      <TableCell>
        <div>
          <div className="font-medium">{userData?.first_name} {userData?.last_name}</div>
          <div className="text-sm text-gray-500">{userData?.email}</div>
        </div>
      </TableCell>
      <TableCell className="font-mono">{transfer.reference}</TableCell>
      <TableCell className="font-medium">{transfer.amount?.toLocaleString()} €</TableCell>
      <TableCell>{transfer.confirmed_at ? formatDate(transfer.confirmed_at) : "-"}</TableCell>
      <TableCell>
        <BankTransferStatusBadge status={transfer.status} />
      </TableCell>
      <TableCell>
        <div className="max-w-xs truncate">
          {transfer.notes || "-"}
        </div>
      </TableCell>
    </TableRow>
  );
}

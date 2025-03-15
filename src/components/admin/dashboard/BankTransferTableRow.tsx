
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, CheckCircleIcon, ReceiptIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BankTransferItem } from "./types/bankTransfer";

interface BankTransferTableRowProps {
  item: BankTransferItem;
  processingId: string | null;
  onConfirmDeposit: (item: BankTransferItem, amount: number) => Promise<void>;
  onRejectDeposit: (item: BankTransferItem) => Promise<void>;
  onConfirmReceipt: (item: BankTransferItem) => Promise<void>;
}

export default function BankTransferTableRow({
  item,
  processingId,
  onConfirmDeposit,
  onRejectDeposit,
  onConfirmReceipt
}: BankTransferTableRowProps) {
  // Extract reference from description if available
  const referenceMatch = item.description.match(/\(réf: (.+?)\)/);
  const reference = referenceMatch ? referenceMatch[1] : "N/A";
  
  // Format date
  const date = new Date(item.created_at);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Check if status is 'received' (French: 'reçu' or English: 'received')
  const isReceived = item.status === 'reçu' || item.status === 'received';
  
  return (
    <TableRow key={item.id}>
      <TableCell>
        <div className="font-medium">{formattedDate}</div>
        <Badge variant="outline" className="mt-1">
          {item.status === 'pending' ? 'En attente' : 
           isReceived ? 'Reçu' : 
           item.status === 'completed' ? 'Confirmé' : 'Rejeté'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {item.profile?.first_name} {item.profile?.last_name}
        </div>
        <div className="text-sm text-gray-500">{item.profile?.email}</div>
      </TableCell>
      <TableCell>
        <div className="font-mono font-medium">{reference}</div>
        <div className="text-sm text-gray-500 mt-1">
          Montant: {item.amount}€
        </div>
      </TableCell>
      <TableCell>
        {item.receipt_confirmed || isReceived ? (
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Virement reçu</span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200"
            onClick={() => onConfirmReceipt(item)}
            disabled={processingId === item.id}
          >
            <ReceiptIcon className="h-4 w-4 mr-1" />
            Confirmer réception
          </Button>
        )}
      </TableCell>
      <TableCell className="text-right">
        {item.status === 'pending' && (
          <div className="flex justify-end gap-2">
            <Input 
              type="number" 
              placeholder="Montant" 
              className="w-24 px-2 py-1 border rounded-md"
              id={`amount-${item.id}`}
              min="100"
              defaultValue={item.amount || ""}
            />
            <Button
              variant="outline"
              size="sm"
              className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
              onClick={() => {
                const inputElem = document.getElementById(`amount-${item.id}`) as HTMLInputElement;
                const amount = parseInt(inputElem.value, 10);
                onConfirmDeposit(item, amount);
              }}
              disabled={processingId === item.id || !item.receipt_confirmed}
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Confirmer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              onClick={() => onRejectDeposit(item)}
              disabled={processingId === item.id}
            >
              <XIcon className="h-4 w-4 mr-1" />
              Rejeter
            </Button>
          </div>
        )}
        {item.status !== 'pending' && (
          <Badge variant={isReceived || item.status === 'completed' ? 'success' : 'destructive'}>
            {isReceived ? 'Reçu' : 
             item.status === 'completed' ? 'Traité' : 'Rejeté'}
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

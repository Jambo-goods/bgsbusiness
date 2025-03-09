
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import { BankTransferItem } from "./types";

interface BankTransferRowProps {
  item: BankTransferItem;
  processingId: string | null;
  onConfirm: (item: BankTransferItem, amount: number) => void;
  onReject: (item: BankTransferItem) => void;
}

export function BankTransferRow({ 
  item, 
  processingId, 
  onConfirm, 
  onReject 
}: BankTransferRowProps) {
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
  
  return (
    <TableRow key={item.id}>
      <TableCell>
        <div className="font-medium">{formattedDate}</div>
        <Badge variant="outline" className="mt-1">
          {item.status === 'pending' ? 'En attente' : item.status === 'completed' ? 'Confirmé' : 'Rejeté'}
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
      </TableCell>
      <TableCell className="text-right">
        {item.status === 'pending' && (
          <div className="flex justify-end gap-2">
            <input 
              type="number" 
              placeholder="Montant" 
              className="w-24 px-2 py-1 border rounded-md"
              id={`amount-${item.id}`}
              min="100"
            />
            <Button
              variant="outline"
              size="sm"
              className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
              onClick={() => {
                const inputElem = document.getElementById(`amount-${item.id}`) as HTMLInputElement;
                const amount = parseInt(inputElem.value, 10);
                onConfirm(item, amount);
              }}
              disabled={processingId === item.id}
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Confirmer
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              onClick={() => onReject(item)}
              disabled={processingId === item.id}
            >
              <XIcon className="h-4 w-4 mr-1" />
              Rejeter
            </Button>
          </div>
        )}
        {item.status !== 'pending' && (
          <Badge variant={item.status === 'completed' ? 'success' : 'destructive'}>
            {item.status === 'completed' ? 'Traité' : 'Rejeté'}
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

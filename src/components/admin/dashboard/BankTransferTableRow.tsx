
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankTransferItem } from "./types/bankTransfer";
import { Check, ReceiptText, XCircle, ArrowDownUp, AlertTriangle } from "lucide-react";

interface BankTransferTableRowProps {
  item: BankTransferItem;
  processingId: string | null;
  onConfirmDeposit: (item: BankTransferItem, amount: number) => Promise<void>;
  onRejectDeposit: (item: BankTransferItem) => Promise<void>;
  onConfirmReceipt: (item: BankTransferItem) => Promise<void>;
  onForceToReceived?: (item: BankTransferItem) => Promise<void>;
}

export default function BankTransferTableRow({
  item,
  processingId,
  onConfirmDeposit,
  onRejectDeposit,
  onConfirmReceipt,
  onForceToReceived
}: BankTransferTableRowProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState(item.amount?.toString() || "");
  
  const handleConfirmClick = () => {
    setShowConfirmDialog(true);
  };
  
  const handleConfirmDialogClose = () => {
    setShowConfirmDialog(false);
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.,]/g, "");
    setDepositAmount(value);
  };
  
  const handleConfirmDeposit = async () => {
    setShowConfirmDialog(false);
    const amountValue = parseFloat(depositAmount.replace(",", "."));
    await onConfirmDeposit(item, amountValue);
  };
  
  // Format date nicely
  const formattedDate = item.created_at 
    ? format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: fr })
    : 'Date inconnue';
    
  const isProcessing = processingId === item.id;
  
  // Determine status color based on status
  const getStatusBg = (status: string): string => {
    if (status === 'received' || status === 'reçu') return 'bg-green-100 text-green-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'receveid') return 'bg-orange-100 text-orange-800 border border-orange-300'; // Handle misspelled status
    return 'bg-gray-100 text-gray-800';
  };
  
  const userName = item.profile 
    ? `${item.profile.first_name || ''} ${item.profile.last_name || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur inconnu';

  const isReceiptConfirmed = item.processed === true;
  const isRejected = item.status === 'rejected';
  const isPending = item.status === 'pending';
  const needsAction = isPending;
  const hasMisspelledStatus = item.status === 'receveid'; // Handle this specific case
  
  return (
    <>
      <TableRow className={isProcessing ? "bg-gray-50" : ""}>
        <TableCell className="font-medium">
          {formattedDate}
          <div className="text-xs text-gray-500">Ref: {item.reference || 'N/A'}</div>
        </TableCell>
        
        <TableCell>
          <div className="flex flex-col">
            <span>{userName}</span>
            <span className="text-xs text-gray-500">{item.profile?.email || 'Email inconnu'}</span>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="flex flex-col">
            <span>{item.reference || 'N/A'}</span>
            <span className="text-xs text-gray-500">
              {item.description || `Virement - ${item.amount || 0}€`}
            </span>
          </div>
        </TableCell>
        
        <TableCell>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBg(item.status)}`}>
              {item.status}
            </span>
            
            {hasMisspelledStatus && (
              <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-amber-300">
                <AlertTriangle className="h-3 w-3" />
                <span>Erreur de statut</span>
              </div>
            )}
            
            {item.processed && (
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Check className="h-3 w-3" />
                <span>Traité</span>
              </div>
            )}
          </div>
        </TableCell>
        
        <TableCell className="text-right space-x-1">
          {isProcessing ? (
            <div className="flex justify-end">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-end gap-1">
              {needsAction && (
                <>
                  <Button 
                    size="sm" 
                    className="h-8 bg-green-600 hover:bg-green-700"
                    onClick={handleConfirmClick}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Valider
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-8"
                    onClick={() => onRejectDeposit(item)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeter
                  </Button>
                </>
              )}
              
              {!isReceiptConfirmed && !isRejected && !hasMisspelledStatus && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8"
                  onClick={() => onConfirmReceipt(item)}
                >
                  <ReceiptText className="h-4 w-4 mr-1" />
                  Confirmer réception
                </Button>
              )}
              
              {(hasMisspelledStatus || isPending) && onForceToReceived && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 border-amber-500 text-amber-700 hover:bg-amber-50"
                  onClick={() => onForceToReceived(item)}
                >
                  <ArrowDownUp className="h-4 w-4 mr-1" />
                  Forcer à Reçu
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
      
      <Dialog open={showConfirmDialog} onOpenChange={handleConfirmDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer le dépôt</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="depositAmount" className="text-right">
                Montant
              </Label>
              <Input
                id="depositAmount"
                type="text"
                value={depositAmount}
                onChange={handleAmountChange}
                className="col-span-3"
                placeholder="Saisir le montant en €"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleConfirmDialogClose}>
              Annuler
            </Button>
            <Button onClick={handleConfirmDeposit}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

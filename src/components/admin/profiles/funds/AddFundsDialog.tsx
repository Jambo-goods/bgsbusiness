
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAddFunds } from './useAddFunds';
import { AddFundsForm } from './AddFundsForm';

export interface AddFundsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  amountToAdd?: string;
  setAmountToAdd?: (amount: string) => void;
  handleAddFundsToAll?: () => Promise<void>;
  isProcessing?: boolean;
  totalProfiles?: number;
  userId?: string;
  userName?: string;
  currentBalance?: number;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AddFundsDialog({
  isOpen,
  onOpenChange,
  amountToAdd = '',
  setAmountToAdd = () => {},
  handleAddFundsToAll,
  isProcessing = false,
  totalProfiles = 0,
  userId,
  userName,
  currentBalance = 0,
  onClose,
  onSuccess
}: AddFundsDialogProps) {
  const {
    operation,
    setOperation,
    description,
    setDescription,
    localAmountToAdd,
    handleAmountChange,
    isSingleUser,
    handleFormSubmit
  } = useAddFunds({
    userId,
    userName,
    currentBalance,
    onClose,
    onSuccess,
    handleAddFundsToAll,
    amountToAdd,
    setAmountToAdd
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSingleUser ? `Gérer les fonds de ${userName}` : "Ajouter des fonds à tous les comptes"}</DialogTitle>
          <DialogDescription>
            {isSingleUser 
              ? `Ajoutez ou retirez des fonds du compte de ${userName}. Solde actuel: ${currentBalance} €`
              : `Ajoutez des fonds à tous les comptes utilisateurs (${totalProfiles} comptes).`
            }
          </DialogDescription>
        </DialogHeader>
        
        <AddFundsForm
          isSingleUser={isSingleUser}
          operation={operation}
          setOperation={setOperation}
          amountValue={localAmountToAdd}
          onAmountChange={handleAmountChange}
          description={description}
          setDescription={setDescription}
          currentBalance={currentBalance}
          isProcessing={isProcessing}
          onClose={onClose}
          onOpenChange={onOpenChange}
          handleSubmit={handleFormSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}


import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/hooks/admin/types";

interface AddFundsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedUser: UserProfile | null;
  amountToAdd: string;
  setAmountToAdd: (amount: string) => void;
  isProcessing: boolean;
  onConfirm: () => void;
}

export default function AddFundsDialog({
  isOpen,
  setIsOpen,
  selectedUser,
  amountToAdd,
  setAmountToAdd,
  isProcessing,
  onConfirm
}: AddFundsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter des fonds au portefeuille</DialogTitle>
          <DialogDescription>
            {selectedUser ? (
              <>Ajouter des fonds au portefeuille de {selectedUser.first_name} {selectedUser.last_name}</>
            ) : (
              <>Ajouter des fonds au portefeuille de l'utilisateur</>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Montant (€)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amountToAdd}
              onChange={(e) => setAmountToAdd(e.target.value)}
              className="col-span-3"
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? 'Traitement en cours...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

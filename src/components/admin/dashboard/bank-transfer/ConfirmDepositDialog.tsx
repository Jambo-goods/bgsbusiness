
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ConfirmDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  depositAmount: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
}

export function ConfirmDepositDialog({
  open,
  onOpenChange,
  depositAmount,
  onAmountChange,
  onConfirm
}: ConfirmDepositDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={onAmountChange}
              className="col-span-3"
              placeholder="Saisir le montant en €"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onConfirm}>Confirmer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

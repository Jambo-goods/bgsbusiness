
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AddFundsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isProcessing: boolean;
  totalProfiles: number;
  handleAddFunds: (amount: number) => Promise<void>;
}

const AddFundsDialog: React.FC<AddFundsDialogProps> = ({
  isOpen,
  setIsOpen,
  isProcessing,
  totalProfiles,
  handleAddFunds
}) => {
  const [amountToAdd, setAmountToAdd] = useState<string>('100');

  const onSubmit = async () => {
    const amount = parseInt(amountToAdd, 10);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    await handleAddFunds(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter des fonds à tous les profils</DialogTitle>
          <DialogDescription>
            Cette action ajoutera le montant spécifié à tous les {totalProfiles} profils dans la base de données.
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
            onClick={onSubmit}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? 'Traitement en cours...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundsDialog;

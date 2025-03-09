
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddFundsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  amountToAdd: string;
  setAmountToAdd: (amount: string) => void;
  handleAddFundsToAll: () => Promise<void>;
  isProcessing: boolean;
  totalProfiles: number;
}

const AddFundsDialog: React.FC<AddFundsDialogProps> = ({
  isOpen,
  onOpenChange,
  amountToAdd,
  setAmountToAdd,
  handleAddFundsToAll,
  isProcessing,
  totalProfiles
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleAddFundsToAll} 
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

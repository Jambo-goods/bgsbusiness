
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AddFundsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentBalance: number;
  onAddFunds: (userId: string, amount: number) => Promise<{ success: boolean, error?: string }>;
}

export const AddFundsDialog: React.FC<AddFundsDialogProps> = ({
  isOpen,
  onOpenChange,
  userId,
  userName,
  currentBalance,
  onAddFunds
}) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const result = await onAddFunds(userId, Number(amount));
      
      if (result.success) {
        toast.success(`${amount} € ajoutés au compte de ${userName}`);
        setAmount('');
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Erreur lors de l\'ajout de fonds');
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Erreur lors de l\'ajout de fonds');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter des fonds</DialogTitle>
          <DialogDescription>
            Ajoutez des fonds au compte de {userName}.
            Solde actuel: {currentBalance.toLocaleString('fr-FR')} €
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Montant (€)
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3"
                autoFocus
                placeholder="Montant à ajouter"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button type="submit" disabled={isProcessing || !amount}>
              {isProcessing ? 'Traitement...' : 'Ajouter les fonds'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

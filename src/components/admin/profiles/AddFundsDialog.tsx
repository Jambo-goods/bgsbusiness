
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [description, setDescription] = useState('');
  const [localAmountToAdd, setLocalAmountToAdd] = useState(amountToAdd);
  const isSingleUser = !!userId;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalAmountToAdd(value);
    if (setAmountToAdd) {
      setAmountToAdd(value);
    }
  };

  const handleSingleUserFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || parseFloat(localAmountToAdd) <= 0) {
      toast.error("Le montant doit être supérieur à zéro");
      return;
    }

    if (operation === 'subtract' && parseFloat(localAmountToAdd) > currentBalance) {
      toast.error("Le montant à déduire ne peut pas être supérieur au solde actuel");
      return;
    }

    try {
      // Calculate the final amount (positive for adding, negative for subtracting)
      const finalAmount = operation === 'add' ? parseFloat(localAmountToAdd) : -parseFloat(localAmountToAdd);
      
      // Create a transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: Math.abs(parseFloat(localAmountToAdd)),
          type: operation === 'add' ? 'deposit' : 'withdrawal',
          description: description || `Ajustement manuel par administrateur (${operation === 'add' ? 'ajout' : 'retrait'})`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update user's wallet balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ wallet_balance: currentBalance + finalAmount })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast.success(
        `${operation === 'add' ? 'Ajout' : 'Retrait'} de fonds réussi`,
        { description: `${localAmountToAdd} € ont été ${operation === 'add' ? 'ajoutés au' : 'retirés du'} compte.` }
      );
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing funds:", error);
      toast.error(
        `Erreur lors du ${operation === 'add' ? 'l\'ajout' : 'retrait'} de fonds`,
        { description: "Veuillez réessayer ultérieurement." }
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSingleUser) {
      handleSingleUserFunds(e);
    } else if (handleAddFundsToAll) {
      handleAddFundsToAll();
    }
  };

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
        
        <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
          {isSingleUser && (
            <div className="space-y-2">
              <Label htmlFor="operation">Opération</Label>
              <RadioGroup 
                id="operation" 
                value={operation} 
                onValueChange={(value) => setOperation(value as 'add' | 'subtract')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add">Ajouter des fonds</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subtract" id="subtract" />
                  <Label htmlFor="subtract">Retirer des fonds</Label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={localAmountToAdd}
              onChange={handleAmountChange}
              required
            />
          </div>
          
          {isSingleUser && (
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Raison de l'ajustement"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={isSingleUser ? onClose : () => onOpenChange(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isProcessing || parseFloat(localAmountToAdd) <= 0}
            >
              {isProcessing ? 'Traitement...' : isSingleUser ? 'Confirmer' : 'Ajouter à tous les comptes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

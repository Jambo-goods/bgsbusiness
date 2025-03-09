
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
  userId: string;
  userName: string;
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFundsDialog({
  userId,
  userName,
  currentBalance,
  onClose,
  onSuccess
}: AddFundsDialogProps) {
  const [amount, setAmount] = useState<number>(0);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : Math.abs(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      toast.error("Le montant doit être supérieur à zéro");
      return;
    }

    if (operation === 'subtract' && amount > currentBalance) {
      toast.error("Le montant à déduire ne peut pas être supérieur au solde actuel");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Calculate the final amount (positive for adding, negative for subtracting)
      const finalAmount = operation === 'add' ? amount : -amount;
      
      // Create a transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: Math.abs(amount),
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
        { description: `${amount} € ont été ${operation === 'add' ? 'ajoutés au' : 'retirés du'} compte.` }
      );
      
      onSuccess();
    } catch (error) {
      console.error("Error processing funds:", error);
      toast.error(
        `Erreur lors du ${operation === 'add' ? 'l\'ajout' : 'retrait'} de fonds`,
        { description: "Veuillez réessayer ultérieurement." }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gérer les fonds</DialogTitle>
          <DialogDescription>
            Ajoutez ou retirez des fonds du compte de {userName}.
            Solde actuel: {currentBalance} €
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={handleAmountChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Raison de l'ajustement"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isProcessing || amount <= 0}
            >
              {isProcessing ? 'Traitement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowUp, ArrowDown } from "lucide-react";

interface AddFundsFormProps {
  isSingleUser: boolean;
  operation: 'add' | 'subtract';
  setOperation: (value: 'add' | 'subtract') => void;
  amountValue: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description: string;
  setDescription: (value: string) => void;
  currentBalance: number;
  isProcessing: boolean;
  onClose: (() => void) | undefined;
  onOpenChange: (open: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const AddFundsForm: React.FC<AddFundsFormProps> = ({
  isSingleUser,
  operation,
  setOperation,
  amountValue,
  onAmountChange,
  description,
  setDescription,
  currentBalance,
  isProcessing,
  onClose,
  onOpenChange,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
              <Label htmlFor="add" className="flex items-center gap-1">
                <ArrowUp className="h-3.5 w-3.5 text-green-500" />
                Ajouter des fonds
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="subtract" id="subtract" />
              <Label htmlFor="subtract" className="flex items-center gap-1">
                <ArrowDown className="h-3.5 w-3.5 text-red-500" />
                Retirer des fonds
              </Label>
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
          value={amountValue}
          onChange={onAmountChange}
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
      
      <div className="flex justify-end gap-2 pt-2">
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
          disabled={isProcessing || parseFloat(amountValue) <= 0}
        >
          {isProcessing ? 'Traitement...' : isSingleUser ? 'Confirmer' : 'Ajouter à tous les comptes'}
        </Button>
      </div>
    </form>
  );
};

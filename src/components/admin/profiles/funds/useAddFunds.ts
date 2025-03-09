
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UseAddFundsProps {
  userId?: string;
  userName?: string;
  currentBalance?: number;
  onClose?: () => void;
  onSuccess?: () => void;
  handleAddFundsToAll?: () => Promise<void>;
  amountToAdd?: string;
  setAmountToAdd?: (amount: string) => void;
}

export const useAddFunds = ({
  userId,
  userName,
  currentBalance = 0,
  onClose,
  onSuccess,
  handleAddFundsToAll,
  amountToAdd = '',
  setAmountToAdd = () => {}
}: UseAddFundsProps) => {
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [description, setDescription] = useState('');
  const [localAmountToAdd, setLocalAmountToAdd] = useState(amountToAdd);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
      setIsProcessing(true);
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
      return true;
    } catch (error) {
      console.error("Error processing funds:", error);
      toast.error(
        `Erreur lors du ${operation === 'add' ? 'l\'ajout' : 'retrait'} de fonds`,
        { description: "Veuillez réessayer ultérieurement." }
      );
      return false;
    } finally {
      setIsProcessing(false);
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

  return {
    operation,
    setOperation,
    description,
    setDescription,
    localAmountToAdd,
    handleAmountChange,
    isProcessing,
    isSingleUser,
    handleFormSubmit
  };
};

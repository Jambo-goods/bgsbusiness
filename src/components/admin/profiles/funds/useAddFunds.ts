
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  amountToAdd,
  setAmountToAdd
}: UseAddFundsProps) => {
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localAmountToAdd, setLocalAmountToAdd] = useState(amountToAdd || '');
  const isSingleUser = !!userId;

  useEffect(() => {
    if (amountToAdd !== undefined) {
      setLocalAmountToAdd(amountToAdd);
    }
  }, [amountToAdd]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalAmountToAdd(value);
    if (setAmountToAdd) {
      setAmountToAdd(value);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      
      if (isSingleUser) {
        // For individual user
        const amount = parseFloat(localAmountToAdd);
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Le montant doit être un nombre positif');
        }
        
        if (userId) {
          // Update wallet balance
          let result;
          
          if (operation === 'add') {
            result = await supabase.rpc('increment_wallet_balance', {
              user_id: userId,
              increment_amount: amount
            });
          } else {
            // Check if there's enough balance for subtraction
            if (currentBalance < amount) {
              throw new Error('Solde insuffisant pour cette opération');
            }
            
            result = await supabase.rpc('increment_wallet_balance', {
              user_id: userId,
              increment_amount: -amount
            });
          }
          
          if (result.error) throw result.error;
          
          // Record the transaction
          const { error: transactionError } = await supabase
            .from('wallet_transactions')
            .insert({
              user_id: userId,
              amount: operation === 'add' ? amount : -amount,
              type: operation === 'add' ? 'deposit' : 'withdrawal',
              status: 'completed',
              description: description || `${operation === 'add' ? 'Ajout' : 'Retrait'} de fonds par administrateur`
            });
          
          if (transactionError) throw transactionError;
          
          toast.success(`Opération réussie : ${operation === 'add' ? 'Ajout' : 'Retrait'} de ${amount}€`);
          
          if (onSuccess) {
            onSuccess();
          }
        }
      } else if (handleAddFundsToAll) {
        // For all users
        await handleAddFundsToAll();
      }
    } catch (error: any) {
      console.error('Error processing funds operation:', error);
      toast.error(error.message || 'Erreur lors de l\'opération');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    operation,
    setOperation,
    description,
    setDescription,
    isProcessing,
    localAmountToAdd,
    handleAmountChange,
    isSingleUser,
    handleFormSubmit
  };
};

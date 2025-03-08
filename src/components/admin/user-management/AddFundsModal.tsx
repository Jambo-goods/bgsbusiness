
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logAdminAction } from '@/services/adminAuthService';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  [key: string]: any;
}

interface AddFundsModalProps {
  user: User | null;
  adminUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddFundsModal = ({ user, adminUserId, isOpen, onClose, onSuccess }: AddFundsModalProps) => {
  const [fundAmount, setFundAmount] = useState('');

  if (!isOpen || !user) return null;

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseInt(fundAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }
    
    try {
      // Add transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: 'deposit',
          description: 'Crédit manuel par administrateur'
        });
        
      if (transactionError) throw transactionError;
      
      // Update user balance
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: user.id, increment_amount: amount }
      );
      
      if (walletError) throw walletError;
      
      // Log admin action
      await logAdminAction(
        adminUserId,
        'wallet_management',
        `Ajout de ${amount}€ au compte de ${user.first_name} ${user.last_name}`,
        user.id,
        undefined,
        amount
      );
      
      toast.success(`${amount}€ ont été ajoutés au compte de ${user.first_name} ${user.last_name}`);
      setFundAmount('');
      onClose();
      onSuccess();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de fonds:", error);
      toast.error("Une erreur s'est produite lors de l'ajout de fonds");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">
          Ajouter des fonds
        </h2>
        <p className="text-gray-600 mb-4">
          Vous ajoutez des fonds au compte de <strong>{user.first_name || 'Utilisateur'} {user.last_name || ''}</strong>
        </p>
        
        <form onSubmit={handleAddFunds}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Montant (€)
            </label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="Montant"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-bgs-blue hover:bg-bgs-blue-light text-white"
            >
              Confirmer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

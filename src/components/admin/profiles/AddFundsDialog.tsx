
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Profile } from '@/hooks/admin/useProfilesData';

interface AddFundsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  onSuccess: () => void;
}

export default function AddFundsDialog({ isOpen, onClose, profiles, onSuccess }: AddFundsDialogProps) {
  const [amountToAdd, setAmountToAdd] = useState<string>('100');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddFundsToAll = async () => {
    try {
      setIsProcessing(true);
      
      // Convert the amount to a number
      const amount = parseInt(amountToAdd, 10);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Le montant doit être un nombre positif');
      }
      
      // Add funds to all profiles
      const promises = profiles.map(async (profile) => {
        // Update the wallet balance directly
        const { error } = await supabase.rpc('increment_wallet_balance', {
          user_id: profile.id,
          increment_amount: amount
        });
        
        if (error) {
          console.error(`Error adding funds to profile ${profile.id}:`, error);
          return false;
        }
        
        // Create a wallet transaction record
        await supabase.from('wallet_transactions').insert({
          user_id: profile.id,
          amount: amount,
          type: 'deposit',
          status: 'completed',
          description: 'Ajout de fonds par administrateur (opération groupée)'
        });
        
        return true;
      });
      
      const results = await Promise.all(promises);
      const successCount = results.filter(result => result).length;
      
      // Log the admin action
      await supabase.from('admin_logs').insert({
        description: `Ajout de ${amount}€ à tous les profils (${successCount}/${profiles.length} réussis)`,
        action_type: 'wallet_management',
        amount: amount
      });
      
      toast.success(`${successCount} profils mis à jour avec succès!`);
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error adding funds:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout des fonds');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter des fonds à tous les profils</DialogTitle>
          <DialogDescription>
            Cette action ajoutera le montant spécifié à tous les {profiles.length} profils dans la base de données.
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
            onClick={onClose}
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
}

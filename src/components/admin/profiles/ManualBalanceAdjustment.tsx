
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/services/adminAuthService";

interface ManualBalanceAdjustmentProps {
  userId: string;
  userName: string;
  currentBalance: number;
  onBalanceUpdated: () => void;
}

export function ManualBalanceAdjustment({
  userId,
  userName,
  currentBalance,
  onBalanceUpdated
}: ManualBalanceAdjustmentProps) {
  const [newBalance, setNewBalance] = useState(currentBalance.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const parsedBalance = parseFloat(newBalance);
      if (isNaN(parsedBalance)) {
        toast.error("Le solde doit être un nombre valide");
        return;
      }
      
      // Get admin user info for logging
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      // First, update the user's wallet balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: parsedBalance })
        .eq('id', userId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Create a transaction record for transparency
      const balanceDifference = parsedBalance - currentBalance;
      if (balanceDifference !== 0) {
        const { error: transactionError } = await supabase
          .from('wallet_transactions')
          .insert({
            user_id: userId,
            amount: Math.abs(balanceDifference),
            type: balanceDifference > 0 ? 'deposit' : 'withdrawal',
            description: description || `Ajustement manuel du solde par administrateur`,
            status: 'completed'
          });
          
        if (transactionError) {
          console.error("Error creating transaction record:", transactionError);
          // Continue anyway since the balance was already updated
        }
      }
      
      // Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Modification manuelle du solde de ${userName} de ${currentBalance}€ à ${parsedBalance}€`,
          userId,
          undefined,
          parsedBalance
        );
      }
      
      toast.success("Solde mis à jour avec succès", {
        description: `Nouveau solde: ${parsedBalance}€`
      });
      
      onBalanceUpdated();
    } catch (error) {
      console.error("Error updating balance:", error);
      toast.error("Erreur lors de la mise à jour du solde");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-gray-200 rounded-md p-4 mt-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Ajustement manuel du solde</h3>
        <p className="text-sm text-gray-500 mb-4">
          Solde actuel: <span className="font-medium">{currentBalance}€</span>
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="newBalance">Nouveau solde (€)</Label>
        <Input
          id="newBalance"
          type="number"
          step="0.01"
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
          placeholder="Entrez le nouveau solde"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Motif du changement (optionnel)</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Raison de l'ajustement"
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting || newBalance === currentBalance.toString()}
      >
        {isSubmitting ? "Mise à jour..." : "Mettre à jour le solde"}
      </Button>
    </form>
  );
}

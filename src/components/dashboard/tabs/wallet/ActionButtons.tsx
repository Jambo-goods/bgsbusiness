
import React, { useState } from "react";
import { Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

export default function ActionButtons({ onDeposit, onWithdraw }: ActionButtonsProps) {
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  
  // Fonction pour effectuer un dépôt
  const handleDeposit = async () => {
    setIsProcessingDeposit(true);
    
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer un dépôt");
        return;
      }
      
      const userId = session.session.user.id;
      const amount = 500; // Montant fixe pour cet exemple
      
      // Créer une transaction de dépôt
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'deposit',
          description: 'Dépôt sur votre compte'
        });
        
      if (transactionError) throw transactionError;
      
      // Mettre à jour le solde du portefeuille
      const { data, error: functionError } = await supabase
        .rpc('increment_wallet_balance', {
          user_id: userId,
          increment_amount: amount
        });
        
      if (functionError) throw functionError;
      
      toast.success(`Dépôt de ${amount}€ effectué avec succès`);
      onDeposit(); // Callback pour mettre à jour l'UI
      
    } catch (error) {
      console.error("Erreur lors du dépôt:", error);
      toast.error("Une erreur s'est produite lors du dépôt");
    } finally {
      setIsProcessingDeposit(false);
    }
  };
  
  // Fonction pour effectuer un retrait
  const handleWithdraw = async () => {
    setIsProcessingWithdrawal(true);
    
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer un retrait");
        return;
      }
      
      const userId = session.session.user.id;
      const amount = 200; // Montant fixe pour cet exemple
      
      // Vérifier le solde actuel
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      if (profileData.wallet_balance < amount) {
        toast.error("Solde insuffisant pour effectuer ce retrait");
        return;
      }
      
      // Créer une transaction de retrait
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'withdrawal',
          description: 'Retrait de votre compte'
        });
        
      if (transactionError) throw transactionError;
      
      // Mettre à jour le solde du portefeuille (avec un montant négatif)
      const { data, error: functionError } = await supabase
        .rpc('increment_wallet_balance', {
          user_id: userId,
          increment_amount: -amount
        });
        
      if (functionError) throw functionError;
      
      toast.success(`Retrait de ${amount}€ effectué avec succès`);
      onWithdraw(); // Callback pour mettre à jour l'UI
      
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Une erreur s'est produite lors du retrait");
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-bgs-blue mb-4">Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleDeposit}
          disabled={isProcessingDeposit}
          className="btn-primary py-3 flex items-center justify-center gap-2"
        >
          {isProcessingDeposit ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Déposer
            </>
          )}
        </button>
        
        <button
          onClick={handleWithdraw}
          disabled={isProcessingWithdrawal}
          className="btn-secondary py-3 flex items-center justify-center gap-2"
        >
          {isProcessingWithdrawal ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Minus className="h-5 w-5" />
              Retirer
            </>
          )}
        </button>
      </div>
    </div>
  );
}

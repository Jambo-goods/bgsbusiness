
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";

export function useWithdrawForm(balance: number, onWithdraw: () => Promise<void>) {
  const [amount, setAmount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isValidForm = () => {
    return (
      amount && 
      parseInt(amount) >= 100 && 
      parseInt(amount) <= balance &&
      bankName.trim().length >= 2 &&
      accountNumber.trim().length >= 8 &&
      accountHolder.trim().length >= 3
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidForm()) {
      toast.error("Veuillez remplir correctement tous les champs");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour effectuer un retrait");
        return;
      }
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, wallet_balance')
        .eq('id', session.session.user.id)
        .single();
        
      if (userError) {
        console.error("Erreur lors de la récupération des données utilisateur:", userError);
        throw new Error("Impossible de récupérer les données utilisateur");
      }
      
      if (userData.wallet_balance < parseInt(amount)) {
        toast.error("Solde insuffisant pour effectuer ce retrait");
        return;
      }

      console.log("Submitting withdrawal request...");
      
      // Calculation for the new balance after withdrawal
      const withdrawalAmount = parseInt(amount);
      const newBalance = userData.wallet_balance - withdrawalAmount;
      
      // First update the user's wallet balance to ensure we don't allow overdrafts
      const { error: balanceUpdateError } = await supabase
        .from('profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', session.session.user.id);
      
      if (balanceUpdateError) {
        console.error("Error updating balance:", balanceUpdateError);
        throw new Error("Impossible de mettre à jour votre solde");
      }
      
      // Insérer la demande de retrait avec toutes les informations bancaires
      const { data: withdrawal, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: session.session.user.id,
          amount: withdrawalAmount,
          bank_info: {
            accountName: accountHolder,
            bankName: bankName,
            accountNumber: accountNumber
          },
          status: 'pending',
          requested_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (error) {
        console.error("Error creating withdrawal request:", error);
        
        // Revert the balance change if the withdrawal request failed
        await supabase
          .from('profiles')
          .update({ wallet_balance: userData.wallet_balance })
          .eq('id', session.session.user.id);
          
        throw error;
      }
      
      console.log("Withdrawal request created successfully:", withdrawal);
      
      // Create a transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: session.session.user.id,
          amount: withdrawalAmount,
          type: 'withdrawal',
          description: `Retrait en attente - ID: ${withdrawal.id}`,
          status: 'pending'
        });
      
      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        // Continue even if there's an error (the withdrawal was created)
      }
      
      // Show notification for withdrawal request
      notificationService.withdrawalStatus(withdrawalAmount, 'pending');
      
      // Notify about the withdrawal request to backend
      try {
        const userName = `${userData.first_name} ${userData.last_name}`;
        
        await supabase.functions.invoke('send-withdrawal-notification', {
          body: {
            user_id: session.session.user.id,
            userName,
            userEmail: userData.email,
            amount: withdrawalAmount,
            bankDetails: {
              accountName: accountHolder,
              bankName: bankName,
              accountNumber: accountNumber
            },
            withdrawal_id: withdrawal.id
          }
        });
        
        console.log("Notification de retrait envoyée avec succès");
      } catch (notifError) {
        console.error("Erreur lors de l'envoi de la notification de retrait:", notifError);
        // Continue even if notification fails
      }
      
      toast.success("Demande de retrait soumise avec succès");
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountHolder("");
      
      // Important: Call onWithdraw to update UI and state
      await onWithdraw();
      
    } catch (error) {
      console.error("Erreur lors du retrait:", error);
      toast.error("Une erreur s'est produite lors de la demande de retrait");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    amount,
    setAmount,
    accountHolder,
    setAccountHolder,
    bankName,
    setBankName,
    accountNumber,
    setAccountNumber,
    isSubmitting,
    isValidForm,
    handleSubmit
  };
}

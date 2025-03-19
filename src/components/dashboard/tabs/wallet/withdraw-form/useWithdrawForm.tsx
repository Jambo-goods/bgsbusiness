
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";

export const useWithdrawForm = (balance: number, onWithdraw: () => Promise<void>) => {
  const [amount, setAmount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidForm = (): boolean => {
    return (
      !!amount && 
      parseFloat(amount) > 0 && 
      parseFloat(amount) <= balance &&
      !!accountHolder && 
      !!bankName && 
      !!accountNumber
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isValidForm()) {
      toast.error("Veuillez remplir tous les champs correctement");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get user session
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Veuillez vous connecter pour effectuer un retrait");
        return;
      }
      
      // Format withdrawal amount
      const withdrawalAmount = parseFloat(amount);
      
      // Bank account info
      const bankInfo = {
        accountName: accountHolder,
        bankName: bankName,
        accountNumber: accountNumber
      };
      
      // Create withdrawal request
      const { error, data } = await supabase.from('withdrawal_requests').insert({
        user_id: session.session.user.id,
        amount: withdrawalAmount,
        status: 'pending',
        bank_info: bankInfo,
        requested_at: new Date().toISOString()
      }).select('id').single();
      
      if (error) throw error;
      
      const withdrawalId = data?.id;
      
      // Send notification for the withdrawal request
      await notificationService.withdrawalRequested(withdrawalAmount);
      
      // Create a transaction entry for the withdrawal request
      await supabase.from('wallet_transactions').insert({
        user_id: session.session.user.id,
        type: 'withdrawal',
        amount: withdrawalAmount,
        status: 'pending',
        description: `Demande de retrait #${withdrawalId} - En attente`,
        created_at: new Date().toISOString()
      });
      
      // Show success toast
      toast.success("Votre demande de retrait a été soumise avec succès");
      
      // Reset form
      setAmount("");
      
      // Update wallet balance
      if (onWithdraw) {
        await onWithdraw();
      }
    } catch (error) {
      console.error("Erreur lors de la demande de retrait:", error);
      toast.error("Une erreur est survenue lors de la demande de retrait");
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
};

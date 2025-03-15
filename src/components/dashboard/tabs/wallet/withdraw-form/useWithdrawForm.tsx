
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

      // Insérer la demande de retrait avec toutes les informations bancaires
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: session.session.user.id,
          amount: parseInt(amount),
          bank_info: {
            accountName: accountHolder,
            bankName: bankName,
            accountNumber: accountNumber
          },
          status: 'pending',
          requested_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      // Envoyer une notification par email à l'administrateur
      try {
        const userName = `${userData.first_name} ${userData.last_name}`;
        
        await supabase.functions.invoke('send-withdrawal-notification', {
          body: {
            userId: session.session.user.id,
            userName,
            userEmail: userData.email,
            amount: parseInt(amount),
            bankDetails: {
              accountName: accountHolder,
              bankName: bankName,
              accountNumber: accountNumber
            }
          }
        });
        
        console.log("Notification de retrait envoyée avec succès");
      } catch (notifError) {
        console.error("Erreur lors de l'envoi de la notification de retrait:", notifError);
        // Nous ne voulons pas faire échouer la demande de retrait si la notification échoue
      }
      
      toast.success("Demande de retrait soumise avec succès");
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountHolder("");
      
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


import React, { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWithdrawForm(walletBalance: number, onSuccess?: () => void) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountOwner, setAccountOwner] = useState("");
  const [iban, setIban] = useState("");
  const [bic, setBic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    bankName?: string;
    accountOwner?: string;
    iban?: string;
    bic?: string;
  }>({});

  const validateForm = useCallback(() => {
    const newErrors: {
      amount?: string;
      bankName?: string;
      accountOwner?: string;
      iban?: string;
      bic?: string;
    } = {};
    let isValid = true;

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = "Le montant est requis";
      isValid = false;
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = "Le montant doit être supérieur à zéro";
        isValid = false;
      } else if (numAmount > walletBalance) {
        newErrors.amount = "Le montant demandé dépasse votre solde disponible";
        isValid = false;
      } else if (numAmount < 50) {
        newErrors.amount = "Le montant minimum de retrait est de 50€";
        isValid = false;
      }
    }

    // Validate bank name
    if (!bankName.trim()) {
      newErrors.bankName = "Le nom de la banque est requis";
      isValid = false;
    }

    // Validate account owner
    if (!accountOwner.trim()) {
      newErrors.accountOwner = "Le nom du titulaire du compte est requis";
      isValid = false;
    }

    // Validate IBAN
    if (!iban.trim()) {
      newErrors.iban = "L'IBAN est requis";
      isValid = false;
    } else if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(iban.replace(/\s/g, ''))) {
      newErrors.iban = "Format d'IBAN invalide";
      isValid = false;
    }

    // Validate BIC
    if (!bic.trim()) {
      newErrors.bic = "Le BIC est requis";
      isValid = false;
    } else if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.replace(/\s/g, ''))) {
      newErrors.bic = "Format de BIC invalide";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [amount, bankName, accountOwner, iban, bic, walletBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Session expirée, veuillez vous reconnecter");
        setIsSubmitting(false);
        return;
      }
      
      const userId = session.session.user.id;
      const withdrawalAmount = parseFloat(amount);
      
      // Create withdrawal request
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: userId,
          amount: withdrawalAmount,
          bank_name: bankName,
          account_owner: accountOwner,
          bank_info: {
            iban: iban.replace(/\s/g, ''),
            bic: bic.replace(/\s/g, '')
          },
          status: 'pending'
        })
        .select()
        .single();
        
      if (withdrawalError) {
        throw withdrawalError;
      }
      
      // Create transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: withdrawalAmount,
          type: 'withdrawal',
          description: `Demande de retrait vers ${bankName}`,
          status: 'pending'
        });
        
      if (transactionError) {
        throw transactionError;
      }
      
      // Temporarily deduct amount from wallet balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          wallet_balance: walletBalance - withdrawalAmount
        })
        .eq('id', userId);
        
      if (profileError) {
        throw profileError;
      }
      
      // Success notification
      toast.success("Demande de retrait envoyée", {
        description: `Votre demande de retrait de ${withdrawalAmount}€ a été enregistrée et sera traitée sous 48h ouvrées.`
      });
      
      // Reset form
      setAmount("");
      setBankName("");
      setAccountOwner("");
      setIban("");
      setBic("");
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast.error("Erreur lors de la demande de retrait", {
        description: "Votre demande n'a pas pu être traitée. Veuillez réessayer plus tard."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = amount.trim() !== "" && 
                     bankName.trim() !== "" && 
                     accountOwner.trim() !== "" && 
                     iban.trim() !== "" &&
                     bic.trim() !== "";

  return {
    amount,
    setAmount,
    bankName,
    setBankName,
    accountOwner,
    setAccountOwner,
    iban,
    setIban,
    bic,
    setBic,
    errors,
    isSubmitting,
    isFormValid,
    handleSubmit
  };
}

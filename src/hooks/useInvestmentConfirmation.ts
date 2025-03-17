import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/services/adminAuthService";

interface InvestmentConfirmationProps {
  investmentId: string;
  onClose: () => void;
  refetch: () => void;
}

export const useInvestmentConfirmation = ({
  investmentId,
  onClose,
  refetch
}: InvestmentConfirmationProps) => {
  const [amount, setAmount] = useState<number | string>("");
  const [processing, setProcessing] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(true);

  const validateAmount = (value: string) => {
    const parsedValue = parseFloat(value);
    const isValid = !isNaN(parsedValue) && parsedValue > 0;
    setIsAmountValid(isValid);
    return isValid;
  };

  const mutation = useMutation(
    async () => {
      if (!validateAmount(amount.toString())) {
        throw new Error("Montant invalide");
      }

      setProcessing(true);

      // Convert amount to number before passing to Supabase
      const amountAsNumber = typeof amount === 'string' ? parseFloat(amount) : amount;

      const { data, error } = await supabase.rpc("confirm_investment", {
        investment_id: investmentId,
        amount: amountAsNumber
      });

      if (error) {
        console.error("Erreur lors de la confirmation de l'investissement:", error);
        throw new Error(
          `Erreur lors de la confirmation de l'investissement: ${error.message}`
        );
      }

      // Log admin action
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      if (adminUser && adminUser.id) {
        await logAdminAction(
          adminUser.id,
          "INVESTMENT_CONFIRMATION",
          `Confirmed investment ${investmentId} with amount ${amountAsNumber}`,
          data?.user_id, // Assuming the function returns the user_id
          investmentId,
          amountAsNumber
        );
      } else {
        console.warn("Admin user not found, cannot log action");
      }

      return data;
    },
    {
      onSuccess: () => {
        toast.success("Investissement confirmé avec succès!");
        refetch();
        onClose();
      },
      onError: (error: any) => {
        console.error(
          "Erreur lors de la confirmation de l'investissement:",
          error.message
        );
        toast.error(
          `Erreur lors de la confirmation de l'investissement: ${error.message}`
        );
      },
      onSettled: () => {
        setProcessing(false);
      }
    }
  );

  const handleConfirm = async () => {
    if (validateAmount(amount.toString())) {
      mutation.mutate();
    } else {
      toast.error("Veuillez entrer un montant valide.");
    }
  };

  return {
    amount,
    setAmount,
    handleConfirm,
    processing,
    isAmountValid,
    validateAmount
  };
};


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FixDepositButtonProps {
  reference?: string;
  withdrawalId?: string;
  amount?: number; // Make amount optional
  onSuccess?: () => void;
  label?: string;
}

export function FixDepositButton({ 
  reference, 
  withdrawalId,
  amount = 0, // Default to 0 if not provided
  onSuccess,
  label
}: FixDepositButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isWithdrawal = !!withdrawalId;
  const buttonText = label || (isWithdrawal 
    ? `Marquer le retrait${amount ? ` de ${amount}€` : ''} comme payé` 
    : `Corriger le dépôt ${reference}`);

  const handleFix = async () => {
    try {
      setIsLoading(true);
      
      // Get current user ID
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        return;
      }
      
      const userId = session.session.user.id;
      
      // Call the fix-deposit function
      const { data, error } = await supabase.functions.invoke('fix-deposit', {
        body: { 
          userId, 
          reference, 
          withdrawalId 
        }
      });
      
      if (error) {
        console.error("Erreur lors de la correction:", error);
        toast.error(isWithdrawal 
          ? "Erreur lors du marquage du retrait comme payé" 
          : "Erreur lors de la correction du dépôt");
        return;
      }
      
      if (data.success) {
        toast.success(data.message || (isWithdrawal 
          ? "Retrait marqué comme payé avec succès" 
          : "Dépôt corrigé avec succès"));
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || (isWithdrawal
          ? "Erreur lors du marquage du retrait comme payé" 
          : "Erreur lors de la correction du dépôt"));
      }
    } catch (error: any) {
      console.error("Erreur:", error.message);
      toast.error("Une erreur s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleFix}
      disabled={isLoading}
      className={isWithdrawal 
        ? "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100" 
        : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isWithdrawal ? "Paiement en cours..." : "Correction en cours..."}
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}


import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FixDepositButtonProps {
  reference?: string;
  amount: number;
  withdrawalId?: string;
  label?: string;
  onSuccess: () => void;
}

export function FixDepositButton({ 
  reference, 
  amount, 
  withdrawalId, 
  label = "Réparer le crédit manquant", 
  onSuccess 
}: FixDepositButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFix = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette opération");
        return;
      }

      // Handle different types of fixes based on provided props
      let result;
      
      if (withdrawalId) {
        // Handle withdrawal fix/cancellation
        result = await supabase.functions.invoke('cancel-withdrawal', {
          body: {
            withdrawalId,
            amount,
            userId: session.session.user.id
          }
        });
      } else if (reference) {
        // Handle deposit fix
        result = await supabase.functions.invoke('fix-missing-deposit', {
          body: {
            reference,
            amount,
            userId: session.session.user.id
          }
        });
      } else {
        toast.error("Données insuffisantes pour effectuer l'opération");
        return;
      }

      if (result.error) {
        console.error("Error fixing operation:", result.error);
        toast.error("Erreur lors de l'opération");
        return;
      }

      console.log("Fix operation response:", result.data);
      toast.success("Opération effectuée avec succès");
      onSuccess();
    } catch (error) {
      console.error("Error during operation:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleFix} 
      disabled={isLoading} 
      className="bg-amber-600 hover:bg-amber-700 text-white hover:text-white"
    >
      {isLoading ? "Traitement en cours..." : label}
    </Button>
  );
}

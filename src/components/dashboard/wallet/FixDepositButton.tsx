
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FixDepositButtonProps {
  reference: string;
  amount: number;
  onSuccess: () => void;
}

export function FixDepositButton({ reference, amount, onSuccess }: FixDepositButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFix = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette opération");
        return;
      }

      const { data, error } = await supabase.functions.invoke('fix-missing-deposit', {
        body: {
          reference,
          amount,
          userId: session.session.user.id
        }
      });

      if (error) {
        console.error("Error fixing deposit:", error);
        toast.error("Erreur lors de la réparation du dépôt");
        return;
      }

      console.log("Fixed deposit response:", data);
      toast.success("Le dépôt a été correctement crédité");
      onSuccess();
    } catch (error) {
      console.error("Error fixing deposit:", error);
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
      {isLoading ? "Traitement en cours..." : "Réparer le crédit manquant"}
    </Button>
  );
}

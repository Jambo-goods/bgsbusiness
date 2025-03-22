
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FixDepositButtonProps {
  reference: string;
  onSuccess?: () => void;
}

export function FixDepositButton({ reference, onSuccess }: FixDepositButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

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
        body: { userId, reference }
      });
      
      if (error) {
        console.error("Erreur lors de la correction du dépôt:", error);
        toast.error("Erreur lors de la correction du dépôt");
        return;
      }
      
      if (data.success) {
        toast.success(data.message || "Dépôt corrigé avec succès");
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || "Erreur lors de la correction du dépôt");
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
      className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Correction en cours...
        </>
      ) : (
        "Corriger le dépôt DEP-396509"
      )}
    </Button>
  );
}

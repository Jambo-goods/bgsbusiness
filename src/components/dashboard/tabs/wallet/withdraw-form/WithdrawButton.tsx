
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface WithdrawButtonProps {
  isFormValid: boolean;
  isSubmitting: boolean;
}

export default function WithdrawButton({ isFormValid, isSubmitting }: WithdrawButtonProps) {
  return (
    <>
      <Button 
        type="submit" 
        className="w-full bg-bgs-blue hover:bg-bgs-blue-light"
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          "Demander un retrait"
        )}
      </Button>
      
      <p className="text-xs text-gray-500 mt-2">
        En soumettant cette demande, vous acceptez que le traitement peut prendre jusqu'à 5 jours ouvrés.
        Les retraits sont soumis à vérification.
      </p>
    </>
  );
}

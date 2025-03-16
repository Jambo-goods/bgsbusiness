
import React from "react";
import { Button } from "@/components/ui/button";

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
        {isSubmitting ? "Traitement en cours..." : "Demander un retrait"}
      </Button>
      
      <p className="text-xs text-gray-500 mt-2">
        En soumettant cette demande, vous acceptez que le traitement peut prendre jusqu'à 5 jours ouvrés.
        Les retraits sont soumis à vérification.
      </p>
    </>
  );
}

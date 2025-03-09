
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function InfoAlert() {
  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        Les retraits sont traités par virement bancaire sous 3-5 jours ouvrés.
        Le montant minimum de retrait est de 100€.
      </AlertDescription>
    </Alert>
  );
}

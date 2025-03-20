
import React from "react";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InfoAlert() {
  return (
    <Alert variant="default" className="bg-blue-50 border-blue-100">
      <InfoIcon className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-700">Processus de retrait</AlertTitle>
      <AlertDescription className="text-blue-600">
        <p className="mb-2">Pour retirer des fonds de votre compte :</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Remplissez ce formulaire avec vos coordonnées bancaires</li>
          <li>Votre demande sera soumise à notre équipe administrative pour validation</li>
          <li>Après validation, les fonds seront virés sur votre compte bancaire</li>
          <li>Vous recevrez une notification à chaque étape du processus</li>
        </ol>
        <p className="mt-2 text-sm text-blue-500">Les délais de traitement varient de 1 à 5 jours ouvrés après approbation.</p>
      </AlertDescription>
    </Alert>
  );
}

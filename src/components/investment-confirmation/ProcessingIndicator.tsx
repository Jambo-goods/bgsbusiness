
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ProcessingIndicatorProps {
  processingStep: number;
}

export default function ProcessingIndicator({ processingStep }: ProcessingIndicatorProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-blue-700 mb-2">Traitement en cours...</h3>
      <Progress value={(processingStep / 5) * 100} className="h-2 mb-3" />
      <p className="text-sm text-blue-600">
        {processingStep === 1 && "Vérification de votre compte..."}
        {processingStep === 2 && "Création de l'investissement..."}
        {processingStep === 3 && "Enregistrement de la transaction..."}
        {processingStep === 4 && "Mise à jour de votre portefeuille..."}
        {processingStep === 5 && "Finalisation de l'opération..."}
      </p>
    </div>
  );
}

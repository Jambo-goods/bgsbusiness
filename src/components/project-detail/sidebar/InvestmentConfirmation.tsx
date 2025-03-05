
import React from "react";
import { Project } from "@/types/project";

interface InvestmentConfirmationProps {
  project: Project;
  investmentAmount: number;
  selectedDuration: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function InvestmentConfirmation({
  project,
  investmentAmount,
  selectedDuration,
  isProcessing,
  onConfirm,
  onCancel
}: InvestmentConfirmationProps) {
  // Calculate annual yield for display
  const annualYield = project.yield * 12;
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 text-center">
        <h4 className="text-lg font-medium text-bgs-blue mb-2">Confirmation de votre investissement</h4>
        <p className="text-bgs-blue/70 mb-4">Veuillez vérifier les détails de votre investissement</p>
        
        <div className="bg-bgs-gray-light p-4 rounded-lg mb-4">
          <div className="mb-2">
            <p className="text-sm text-bgs-blue/70">Projet</p>
            <p className="font-medium text-bgs-blue">{project.name}</p>
          </div>
          <div className="mb-2">
            <p className="text-sm text-bgs-blue/70">Montant</p>
            <p className="font-medium text-bgs-blue">{investmentAmount}€</p>
          </div>
          <div className="mb-2">
            <p className="text-sm text-bgs-blue/70">Durée</p>
            <p className="font-medium text-bgs-blue">{selectedDuration} mois</p>
          </div>
          <div className="mb-2">
            <p className="text-sm text-bgs-blue/70">Rendement mensuel</p>
            <p className="font-medium text-bgs-blue">{project.yield}% ({annualYield}% annualisé)</p>
          </div>
        </div>
        
        <p className="text-sm text-bgs-blue/70 mb-4">
          En confirmant, vous acceptez d'investir {investmentAmount}€ pour une durée de {selectedDuration} mois dans ce projet.
        </p>
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={onCancel}
          className="w-1/2 btn-secondary" 
          disabled={isProcessing}
        >
          Annuler
        </button>
        <button 
          onClick={onConfirm}
          className="w-1/2 btn-primary flex items-center justify-center gap-2" 
          disabled={isProcessing}
        >
          {isProcessing ? "Traitement en cours..." : "Confirmer"}
        </button>
      </div>
    </div>
  );
}

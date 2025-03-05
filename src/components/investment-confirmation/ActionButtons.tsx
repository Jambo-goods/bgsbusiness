
import React from "react";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle } from "lucide-react";

interface ActionButtonsProps {
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActionButtons({ confirming, onConfirm, onCancel }: ActionButtonsProps) {
  return (
    <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row gap-3 justify-end items-center">
      <div className="flex items-center gap-1.5 text-gray-500 mr-auto">
        <Lock className="h-4 w-4" />
        <span className="text-sm">Transaction sécurisée</span>
      </div>
      
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={confirming}
        className="w-full md:w-auto"
      >
        Annuler
      </Button>
      <Button
        className="w-full md:w-auto bg-gradient-to-r from-bgs-blue to-bgs-blue-light hover:shadow-lg transition-all duration-300 text-white"
        onClick={onConfirm}
        disabled={confirming}
      >
        {confirming ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Confirmation en cours...
          </span>
        ) : (
          <span className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Confirmer l'investissement
          </span>
        )}
      </Button>
    </div>
  );
}

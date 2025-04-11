
import React from 'react';
import { AlertCircle } from "lucide-react";
import { FixDepositButton } from "@/components/dashboard/wallet/FixDepositButton";

interface MissingDepositAlertProps {
  hasMissingDeposit: boolean;
  onFixSuccess: () => void;
}

export default function MissingDepositAlert({ hasMissingDeposit, onFixSuccess }: MissingDepositAlertProps) {
  if (!hasMissingDeposit) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
      <div className="space-y-2">
        <div>
          <p className="font-medium text-amber-800">Dépôt non crédité détecté</p>
          <p className="text-amber-700 text-sm">Votre virement bancaire (DEP-396509) a été reçu mais n'a pas été crédité sur votre compte. Utilisez le bouton ci-dessous pour résoudre ce problème.</p>
        </div>
        <FixDepositButton 
          reference="DEP-396509"
          amount={500} 
          onSuccess={onFixSuccess}
        />
      </div>
    </div>
  );
}

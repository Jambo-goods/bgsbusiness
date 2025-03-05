
import React from "react";
import { ShieldCheck } from "lucide-react";

export default function SecuritySection() {
  return (
    <div className="bg-blue-50 p-5 rounded-lg">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-700 mb-1">Sécurité & Protection</h3>
          <p className="text-sm text-blue-600">
            Votre investissement est sécurisé par contrat et conforme à la réglementation financière en vigueur. 
            Les fonds seront directement transférés au projet et votre investissement sera suivi en temps réel.
          </p>
        </div>
      </div>
    </div>
  );
}

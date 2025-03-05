
import React from "react";
import { AlertCircle } from "lucide-react";

interface MinimumInvestmentWarningProps {
  minInvestment: number;
}

export default function MinimumInvestmentWarning({ minInvestment }: MinimumInvestmentWarningProps) {
  return (
    <div className="flex items-start gap-2 text-amber-600 mb-4 p-3 bg-amber-50 rounded-md">
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="text-sm">
        L'investissement minimum pour ce projet est de {minInvestment}€.
      </p>
    </div>
  );
}

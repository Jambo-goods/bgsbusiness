
import React from "react";

interface CapitalTabProps {
  investmentTotal: number;
}

export default function CapitalTab({ investmentTotal }: CapitalTabProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Capital investi</h2>
      <div className="text-3xl font-bold text-bgs-blue mb-4">{investmentTotal.toLocaleString()} €</div>
      <p className="text-sm text-bgs-gray-medium mb-4">Montant total investi dans les projets actifs.</p>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-bgs-gray-medium">BGS Wood Africa</span>
            <span className="font-medium text-bgs-blue">2500 €</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-bgs-gray-medium">BGS Energy</span>
            <span className="font-medium text-bgs-blue">2000 €</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-bgs-gray-medium">BGS Logistics</span>
            <span className="font-medium text-bgs-blue">3000 €</span>
          </div>
        </div>
      </div>
    </div>
  );
}

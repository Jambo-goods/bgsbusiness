
import React from "react";

export default function YieldTab() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Rendement mensuel estimé</h2>
      <div className="text-3xl font-bold text-green-600 mb-4">84 €</div>
      <p className="text-sm text-bgs-gray-medium mb-4">Basé sur un rendement annuel moyen de 13.5% sur votre capital investi.</p>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-bgs-gray-medium">BGS Wood Africa (12%)</span>
            <span className="font-medium text-green-600">25 €/mois</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-bgs-gray-medium">BGS Energy (14%)</span>
            <span className="font-medium text-green-600">23 €/mois</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-bgs-gray-medium">BGS Logistics (15%)</span>
            <span className="font-medium text-green-600">36 €/mois</span>
          </div>
        </div>
      </div>
    </div>
  );
}

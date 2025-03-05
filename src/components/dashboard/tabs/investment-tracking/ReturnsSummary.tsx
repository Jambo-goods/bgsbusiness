
import React from "react";

interface ReturnsSummaryProps {
  totalPaid: number;
  totalPending: number;
  averageMonthlyReturn: number;
}

export default function ReturnsSummary({ 
  totalPaid, 
  totalPending, 
  averageMonthlyReturn 
}: ReturnsSummaryProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-xs text-bgs-gray-medium">Total des rendements perçus</p>
        <p className="text-lg font-medium text-bgs-blue">{totalPaid} €</p>
      </div>
      
      <div className="bg-orange-50 p-3 rounded-md">
        <p className="text-xs text-bgs-gray-medium">Rendements en attente</p>
        <p className="text-lg font-medium text-bgs-orange">{totalPending} €</p>
      </div>
      
      <div className="bg-green-50 p-3 rounded-md">
        <p className="text-xs text-bgs-gray-medium">Rendement mensuel moyen</p>
        <p className="text-lg font-medium text-green-600">
          {averageMonthlyReturn} €
        </p>
      </div>
    </div>
  );
}

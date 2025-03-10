
import React from "react";
import { RefreshCcw } from "lucide-react";

export interface ReturnsSummaryProps {
  totalPaid: number;
  totalPending: number;
  averageMonthlyReturn: number;
  isRefreshing?: boolean;
  onRefresh: () => void;
}

const ReturnsSummary = ({ 
  totalPaid, 
  totalPending, 
  averageMonthlyReturn,
  isRefreshing = false,
  onRefresh 
}: ReturnsSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-r from-green-100 to-green-50 p-5 rounded-lg border border-green-100">
        <h3 className="text-sm font-semibold text-green-800 mb-2">Rendements versés</h3>
        <div className="text-2xl font-bold text-green-700">{totalPaid.toLocaleString()} €</div>
        <p className="text-xs text-green-600 mt-1">
          Total des rendements déjà versés
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-5 rounded-lg border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Rendements à venir</h3>
        <div className="text-2xl font-bold text-blue-700">{totalPending.toLocaleString()} €</div>
        <p className="text-xs text-blue-600 mt-1">
          Rendements prévus pour les 6 prochains mois
        </p>
      </div>
      
      <div className="bg-white p-5 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Rendement mensuel moyen</h3>
          <button 
            onClick={onRefresh}
            className="text-bgs-blue hover:text-bgs-blue-dark text-xs flex items-center gap-1"
          >
            <RefreshCcw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
        <div className="text-2xl font-bold text-bgs-blue">
          {averageMonthlyReturn.toLocaleString()} €
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Moyenne mensuelle calculée sur l'année
        </p>
      </div>
    </div>
  );
};

export default ReturnsSummary;

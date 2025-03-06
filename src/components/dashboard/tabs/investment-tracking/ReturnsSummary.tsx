
import React from "react";
import { TrendingUp, CheckCircle, Clock, RefreshCw } from "lucide-react";

interface ReturnsSummaryProps {
  totalPaid: number;
  totalPending: number;
  averageMonthlyReturn: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function ReturnsSummary({ 
  totalPaid, 
  totalPending, 
  averageMonthlyReturn,
  isRefreshing = false,
  onRefresh
}: ReturnsSummaryProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
      <div className="bg-green-50 p-4 rounded-md transition-all duration-300 hover:shadow-sm">
        <div className="flex items-center mb-2 justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 p-1.5 rounded-lg mr-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-bgs-gray-medium">Total des rendements perçus</p>
          </div>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="text-green-600 hover:text-green-800 transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        <p className="text-lg font-medium text-green-600">{totalPaid} €</p>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-md transition-all duration-300 hover:shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-orange-100 p-1.5 rounded-lg mr-2">
            <Clock className="h-4 w-4 text-bgs-orange" />
          </div>
          <p className="text-xs text-bgs-gray-medium">Rendements en attente</p>
        </div>
        <p className="text-lg font-medium text-bgs-orange">{totalPending} €</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md transition-all duration-300 hover:shadow-sm">
        <div className="flex items-center mb-2">
          <div className="bg-blue-100 p-1.5 rounded-lg mr-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xs text-bgs-gray-medium">Rendement mensuel moyen</p>
        </div>
        <p className="text-lg font-medium text-blue-600">
          {averageMonthlyReturn} €
        </p>
      </div>
    </div>
  );
}

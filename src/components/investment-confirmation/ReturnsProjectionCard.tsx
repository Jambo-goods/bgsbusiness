
import React from "react";
import { TrendingUp } from "lucide-react";
import { PendingInvestment } from "@/types/investment";
import { calculateReturns } from "@/utils/investment-utils";

interface ReturnsProjectionCardProps {
  pendingInvestment: PendingInvestment;
}

export default function ReturnsProjectionCard({ pendingInvestment }: ReturnsProjectionCardProps) {
  const returns = calculateReturns(
    pendingInvestment.amount, 
    pendingInvestment.yield, 
    pendingInvestment.duration
  );
  
  return (
    <div className="bg-gray-50 p-5 rounded-lg">
      <h2 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
        Prévision des rendements
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between pb-2 border-b border-gray-200">
          <span className="text-gray-600">Rendement mensuel</span>
          <span className="font-medium text-green-600">
            {returns.monthlyReturn.toLocaleString(undefined, {maximumFractionDigits: 2})}€
          </span>
        </div>
        <div className="flex justify-between pb-2 border-b border-gray-200">
          <span className="text-gray-600">Rendement total</span>
          <span className="font-medium text-green-600">
            {returns.totalReturn.toLocaleString(undefined, {maximumFractionDigits: 2})}€
          </span>
        </div>
        <div className="flex justify-between pb-2 border-b border-gray-200">
          <span className="text-gray-600">Capital initial</span>
          <span className="font-medium text-gray-900">{pendingInvestment.amount.toLocaleString()}€</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Intérêts générés</span>
          <span className="font-medium text-green-600">
            {(returns.totalReturn - pendingInvestment.amount).toLocaleString(undefined, {maximumFractionDigits: 2})}€
          </span>
        </div>
      </div>
    </div>
  );
}

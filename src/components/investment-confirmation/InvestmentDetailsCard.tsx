
import React from "react";
import { DollarSign, Calendar, Percent } from "lucide-react";
import { PendingInvestment } from "@/types/investment";

interface InvestmentDetailsCardProps {
  pendingInvestment: PendingInvestment;
}

export default function InvestmentDetailsCard({ pendingInvestment }: InvestmentDetailsCardProps) {
  return (
    <div className="bg-gray-50 p-5 rounded-lg">
      <h2 className="font-semibold text-lg mb-4 text-gray-800 flex items-center">
        <DollarSign className="h-5 w-5 mr-2 text-bgs-blue" />
        Détails de l'investissement
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between pb-2 border-b border-gray-200">
          <span className="text-gray-600">Projet</span>
          <span className="font-medium text-gray-900">{pendingInvestment.projectName}</span>
        </div>
        <div className="flex justify-between pb-2 border-b border-gray-200">
          <span className="text-gray-600">Montant investi</span>
          <span className="font-medium text-gray-900">{pendingInvestment.amount.toLocaleString()}€</span>
        </div>
        <div className="flex justify-between pb-2 border-b border-gray-200">
          <span className="text-gray-600">Durée</span>
          <span className="font-medium text-gray-900 flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
            {pendingInvestment.duration} mois
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Taux de rendement</span>
          <span className="font-medium text-green-600 flex items-center">
            <Percent className="h-4 w-4 mr-1.5" />
            {pendingInvestment.yield}% par mois
          </span>
        </div>
      </div>
    </div>
  );
}

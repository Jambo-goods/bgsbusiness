
import React from "react";
import { Progress } from "@/components/ui/progress";

interface InvestmentItemProps {
  investment: any;
}

export default function InvestmentItem({ investment }: InvestmentItemProps) {
  return (
    <div className="border bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <img 
          src={investment.projects?.image} 
          alt={investment.projects?.name} 
          className="w-full md:w-40 h-32 object-cover"
        />
        <div className="p-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-bgs-blue text-sm mb-0.5">{investment.projects?.name}</h3>
              <p className="text-xs text-bgs-gray-medium mb-2">{investment.projects?.location}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              investment.projects?.status === 'active' 
                ? 'bg-blue-100 text-blue-600' 
                : investment.projects?.status === 'completed'
                ? 'bg-green-100 text-green-600'
                : 'bg-orange-100 text-orange-600'
            }`}>
              {investment.projects?.status === 'active' ? 'Actif' : investment.projects?.status === 'completed' ? 'Complété' : 'À venir'}
            </span>
          </div>
          
          <p className="text-xs text-bgs-blue/80 mb-3 line-clamp-1">
            {investment.projects?.description}
          </p>
          
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bgs-gray-medium">Progression</span>
            <span className="font-medium text-bgs-blue">{investment.projects?.fundingProgress}%</span>
          </div>
          <Progress value={investment.projects?.fundingProgress} className="h-1 bg-gray-100" indicatorClassName="bg-bgs-orange" />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-bgs-gray-medium">Montant investi</p>
              <p className="font-medium text-bgs-blue text-sm">{investment.amount} €</p>
            </div>
            <div>
              <p className="text-xs text-bgs-gray-medium">Rendement mensuel</p>
              <p className="font-medium text-green-500 text-sm">{investment.projects?.yield}%</p>
            </div>
            <div>
              <p className="text-xs text-bgs-gray-medium">Date</p>
              <p className="font-medium text-bgs-blue text-sm">{new Date(investment.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-xs text-bgs-gray-medium">Duration</p>
              <p className="font-medium text-bgs-blue text-sm">{investment.duration} mois</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

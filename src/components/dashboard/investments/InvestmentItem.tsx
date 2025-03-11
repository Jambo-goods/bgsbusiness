
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Calendar, Coins, Clock } from "lucide-react";

interface InvestmentItemProps {
  investment: any;
}

export default function InvestmentItem({ investment }: InvestmentItemProps) {
  const getStatusBadgeStyles = (status: string) => {
    switch(status) {
      case 'active': 
        return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-600 hover:bg-green-200';
      default:
        return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
    }
  };

  return (
    <div className="border bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-48 h-40 md:h-auto">
          <img 
            src={investment.projects?.image} 
            alt={investment.projects?.name} 
            className="w-full h-full object-cover"
          />
          <Badge 
            className={`absolute top-2 right-2 ${getStatusBadgeStyles(investment.projects?.status)}`}
          >
            {investment.projects?.status === 'active' ? 'Actif' : 
             investment.projects?.status === 'completed' ? 'Complété' : 'À venir'}
          </Badge>
        </div>
        
        <div className="p-4 flex-1">
          <div className="mb-3">
            <h3 className="font-semibold text-bgs-blue text-lg mb-1">{investment.projects?.name}</h3>
            <p className="text-xs text-bgs-gray-medium flex items-center">
              <span className="mr-4">{investment.projects?.location}</span>
            </p>
          </div>
          
          <p className="text-sm text-bgs-blue/80 mb-4 line-clamp-2">
            {investment.projects?.description}
          </p>
          
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-bgs-gray-medium">Progression du financement</span>
            <span className="text-xs font-medium">{investment.projects?.fundingProgress || 0}%</span>
          </div>
          <Progress 
            value={investment.projects?.fundingProgress} 
            className="h-1.5 bg-gray-100 mb-4" 
            indicatorClassName="bg-bgs-orange" 
          />
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-2 rounded-md">
              <p className="text-xs text-bgs-gray-medium flex items-center"><Coins className="h-3 w-3 mr-1" /> Montant investi</p>
              <p className="font-semibold text-bgs-blue text-sm">{investment.amount} €</p>
            </div>
            <div className="bg-green-50 p-2 rounded-md">
              <p className="text-xs text-bgs-gray-medium flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> Rendement</p>
              <p className="font-semibold text-green-600 text-sm">{investment.projects?.yield}%</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-md">
              <p className="text-xs text-bgs-gray-medium flex items-center"><Calendar className="h-3 w-3 mr-1" /> Date</p>
              <p className="font-semibold text-bgs-blue text-sm">{new Date(investment.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-md">
              <p className="text-xs text-bgs-gray-medium flex items-center"><Clock className="h-3 w-3 mr-1" /> Durée</p>
              <p className="font-semibold text-bgs-blue text-sm">{investment.duration} mois</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

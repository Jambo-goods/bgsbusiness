
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Calendar, Coins, Clock, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

  // Format the date using date-fns
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
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
              <p className="font-semibold text-bgs-blue text-sm">{formatDate(investment.date || investment.created_at)}</p>
            </div>
            <div className="bg-purple-50 p-2 rounded-md">
              <p className="text-xs text-bgs-gray-medium flex items-center"><Clock className="h-3 w-3 mr-1" /> Durée</p>
              <p className="font-semibold text-bgs-blue text-sm">{investment.duration} mois</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Link to={`/dashboard/investment-tracking/${investment.id}`}>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                Suivre cet investissement
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

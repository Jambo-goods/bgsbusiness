
import React from "react";
import { Project } from "@/types/project";
import { TrendingUp, Clock, Calculator, Info } from "lucide-react";
import { formatCurrency } from "@/utils/currencyUtils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvestmentSummaryProps {
  project: Project;
  investmentAmount: number;
  duration: number;
  onInvest: () => void;
  monthlyReturn: number;
  totalReturn: number;
}

export default function InvestmentSummary({ 
  project, 
  investmentAmount,
  duration,
  onInvest,
  monthlyReturn,
  totalReturn
}: InvestmentSummaryProps) {
  // Calculate annual yield from monthly yield
  const annualYield = project.yield * 12;
  const firstPaymentDelay = project.firstPaymentDelayMonths || 1;
  
  // Calculate correct monthly return based on investment amount and yield percentage
  const correctMonthlyReturn = investmentAmount * (project.yield / 100);
  
  // Calculate the correct total return - ONLY the accumulated returns, not including initial investment
  const effectiveMonths = Math.max(0, duration - firstPaymentDelay);
  const correctTotalReturn = correctMonthlyReturn * effectiveMonths;
  
  return (
    <div className="bg-gradient-to-br from-white to-bgs-gray-light p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
      <h4 className="text-sm font-medium text-bgs-blue mb-3">Résumé de l'investissement</h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-bgs-blue">
            <div className="bg-bgs-orange/10 p-1.5 rounded-lg">
              <TrendingUp size={14} className="text-bgs-orange" />
            </div>
            <span>Rendement mensuel</span>
          </div>
          <span className="font-semibold text-bgs-orange">{project.yield}% par mois</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-bgs-blue">
            <div className="bg-green-100 p-1.5 rounded-lg">
              <TrendingUp size={14} className="text-green-600" />
            </div>
            <span>Rendement annualisé</span>
          </div>
          <span className="font-semibold text-green-600">{annualYield}% par an</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-bgs-blue">
            <div className="bg-bgs-blue/10 p-1.5 rounded-lg">
              <Clock size={14} className="text-bgs-blue" />
            </div>
            <span>Durée</span>
          </div>
          <span className="font-semibold text-bgs-blue">{duration} mois</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <Clock size={14} className="text-amber-600" />
            </div>
            <span>Délai 1er versement</span>
          </div>
          <span className="font-semibold text-amber-600">{firstPaymentDelay} mois</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-bgs-blue">
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <Calculator size={14} className="text-purple-600" />
            </div>
            <span>Revenus mensuels</span>
          </div>
          <span className="font-semibold text-purple-600">{formatCurrency(correctMonthlyReturn)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-bgs-blue">
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <Calculator size={14} className="text-purple-600" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <span>Total des revenus</span>
                    <Info size={16} className="text-purple-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white p-2 border border-gray-200 shadow-md text-xs">
                  <p>Uniquement les revenus générés sur la période</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-semibold text-purple-600">{formatCurrency(correctTotalReturn)}</span>
        </div>
      </div>
      
      {/* Add investment button */}
      <button 
        onClick={onInvest}
        className="w-full btn-primary mt-4"
      >
        Investir {formatCurrency(investmentAmount)}
      </button>
    </div>
  );
}

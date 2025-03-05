
import { Progress } from "@/components/ui/progress";
import { ChevronRightIcon } from "lucide-react";

interface InvestmentDistributionProps {
  setActiveTab: (tab: string) => void;
}

export default function InvestmentDistribution({ setActiveTab }: InvestmentDistributionProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-bgs-blue">
          Répartition
        </h2>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bgs-gray-medium">BGS Wood Africa (1.25% par mois)</span>
            <span className="font-medium text-bgs-blue">2500 €</span>
          </div>
          <Progress value={33} className="h-1 bg-gray-100" indicatorClassName="bg-bgs-orange" />
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bgs-gray-medium">BGS Energy (1% par mois)</span>
            <span className="font-medium text-bgs-blue">2000 €</span>
          </div>
          <Progress value={27} className="h-1 bg-gray-100" indicatorClassName="bg-blue-500" />
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-bgs-gray-medium">BGS Logistics (1.08% par mois)</span>
            <span className="font-medium text-bgs-blue">3000 €</span>
          </div>
          <Progress value={40} className="h-1 bg-gray-100" indicatorClassName="bg-green-500" />
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button 
          onClick={() => setActiveTab("investments")}
          className="flex items-center justify-between w-full text-bgs-orange hover:text-bgs-orange-light transition-colors text-xs font-medium"
        >
          <span>Voir tous mes investissements</span>
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

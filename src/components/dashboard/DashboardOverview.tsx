
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";
import { Wallet, TrendingUp, CreditCard } from "lucide-react";
import { calculateTotalInvested, calculateAvailableBalance, calculateMonthlyReturn } from "@/utils/accountUtils";
import DepositModal from "./DepositModal";

interface DashboardOverviewProps {
  investmentTotal: number;
  projectsCount: number;
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
}

export default function DashboardOverview({
  investmentTotal,
  projectsCount,
  userInvestments,
  setActiveTab
}: DashboardOverviewProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  // Calculate account metrics
  const availableBalance = calculateAvailableBalance();
  const monthlyReturn = calculateMonthlyReturn(userInvestments);
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center mb-2">
            <Wallet size={20} className="text-bgs-blue/70 mr-2" />
            <h3 className="text-sm font-medium text-bgs-blue/70">
              Solde disponible
            </h3>
          </div>
          <p className="text-3xl font-bold text-bgs-blue">
            {availableBalance.toLocaleString()} €
          </p>
          <button 
            onClick={() => setIsDepositModalOpen(true)}
            className="mt-4 text-sm text-bgs-orange hover:text-bgs-orange-light transition-colors"
          >
            Faire un dépôt
          </button>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center mb-2">
            <CreditCard size={20} className="text-bgs-blue/70 mr-2" />
            <h3 className="text-sm font-medium text-bgs-blue/70">
              Capital investi
            </h3>
          </div>
          <p className="text-3xl font-bold text-bgs-blue">
            {investmentTotal.toLocaleString()} €
          </p>
          <p className="mt-4 text-sm text-bgs-blue/70">
            {projectsCount} projets actifs
          </p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center mb-2">
            <TrendingUp size={20} className="text-bgs-blue/70 mr-2" />
            <h3 className="text-sm font-medium text-bgs-blue/70">
              Rendement mensuel
            </h3>
          </div>
          <p className="text-3xl font-bold text-green-500">
            {monthlyReturn.toFixed(2)} €
          </p>
          <p className="mt-4 text-sm text-bgs-blue/70">
            {(monthlyReturn * 12).toFixed(2)} € par an
          </p>
        </div>
      </div>
      
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">
          Mes investissements récents
        </h2>
        <div className="space-y-4">
          {userInvestments.map((project) => (
            <div key={project.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <img 
                  src={project.image} 
                  alt={project.name} 
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-bgs-blue">{project.name}</h3>
                  <p className="text-sm text-bgs-blue/70">{project.location}</p>
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-bgs-blue/70">Progression</span>
                      <span className="text-xs font-medium text-bgs-blue">
                        {project.fundingProgress}%
                      </span>
                    </div>
                    <Progress value={project.fundingProgress} className="h-1.5" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-bgs-blue">2500 €</p>
                  <p className="text-sm text-green-500">+{project.yield}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button 
            onClick={() => setActiveTab("investments")}
            className="text-bgs-orange hover:text-bgs-orange-light transition-colors"
          >
            Voir tous mes investissements
          </button>
        </div>
      </div>
      
      {/* Deposit Modal */}
      <DepositModal 
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </div>
  );
}

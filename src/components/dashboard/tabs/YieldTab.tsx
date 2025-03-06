
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function YieldTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyYield, setMonthlyYield] = useState(0);
  const [annualYield, setAnnualYield] = useState(0);
  const [annualPercent, setAnnualPercent] = useState(0);
  const [investments, setInvestments] = useState<{
    projectName: string;
    monthlyRate: number;
    amount: number;
    monthlyReturn: number;
  }[]>([]);

  useEffect(() => {
    fetchInvestmentYields();
  }, []);

  const fetchInvestmentYields = async () => {
    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error("Veuillez vous connecter pour accéder à vos rendements");
        return;
      }
      
      // Fetch user investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('amount, yield_rate, project_id')
        .eq('user_id', sessionData.session.user.id)
        .eq('status', 'active');
        
      if (investmentsError) {
        console.error("Erreur lors de la récupération des investissements:", investmentsError);
        throw investmentsError;
      }
      
      if (!investmentsData || investmentsData.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // Get project details for each investment
      const projectIds = investmentsData.map(inv => inv.project_id);
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, yield')
        .in('id', projectIds);
        
      if (projectsError) {
        console.error("Erreur lors de la récupération des projets:", projectsError);
        throw projectsError;
      }
      
      // Calculate yields for each investment
      let totalMonthlyYield = 0;
      let weightedAnnualPercent = 0;
      let totalInvestment = 0;
      
      const investmentsWithYields = investmentsData.map(investment => {
        const project = projectsData?.find(p => p.id === investment.project_id);
        const monthlyRate = project?.yield || investment.yield_rate;
        const monthlyReturn = (monthlyRate / 100) * investment.amount;
        
        totalMonthlyYield += monthlyReturn;
        weightedAnnualPercent += (monthlyRate * 12) * investment.amount;
        totalInvestment += investment.amount;
        
        return {
          projectName: project?.name || 'Projet inconnu',
          monthlyRate: monthlyRate,
          amount: investment.amount,
          monthlyReturn: monthlyReturn
        };
      });
      
      // Calculate annual yield and percentage
      const calculatedAnnualYield = totalMonthlyYield * 12;
      const calculatedAnnualPercent = totalInvestment > 0 
        ? (weightedAnnualPercent / totalInvestment) 
        : 0;
      
      setMonthlyYield(Math.round(totalMonthlyYield));
      setAnnualYield(Math.round(calculatedAnnualYield));
      setAnnualPercent(parseFloat(calculatedAnnualPercent.toFixed(2)));
      setInvestments(investmentsWithYields);
      
    } catch (error) {
      console.error("Erreur lors du calcul des rendements:", error);
      toast.error("Impossible de calculer vos rendements");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Rendement mensuel estimé</h2>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-green-600 mb-4">{monthlyYield} € par mois</div>
          <p className="text-sm text-bgs-gray-medium mb-4">
            Basé sur un rendement mensuel moyen de {(annualPercent / 12).toFixed(2)}% ({annualPercent}% annualisé par an) sur votre capital investi.
          </p>
          
          <div className="space-y-4">
            {investments.length > 0 ? (
              investments.map((investment, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-bgs-gray-medium">
                      {investment.projectName} ({investment.monthlyRate}% par mois)
                    </span>
                    <span className="font-medium text-green-600">
                      {Math.round(investment.monthlyReturn)} €/mois
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-bgs-gray-medium">
                Vous n'avez pas encore d'investissements actifs.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

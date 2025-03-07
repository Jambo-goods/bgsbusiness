
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, TrendingUp, DollarSign, RefreshCw } from "lucide-react";

export default function YieldTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:investments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        // When any change happens to investments, refetch
        fetchInvestmentYields();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
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
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInvestmentYields();
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-lg">
            <BarChart3 className="h-5 w-5 text-bgs-blue" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-bgs-blue">Rendement mensuel estimé</h2>
            <p className="text-xs text-gray-500 mt-0.5">Basé sur vos investissements actifs</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light p-5 rounded-lg text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/80">Rendement mensuel</span>
                <div className="bg-white/10 p-1.5 rounded-full">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 flex items-center">
                {monthlyYield} €
              </div>
              <div className="text-xs text-white/70">
                {(annualPercent / 12).toFixed(2)}% par mois
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Rendement annuel</span>
                <div className="bg-gray-200 p-1.5 rounded-full">
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-bgs-blue mb-1">
                {annualYield} €
              </div>
              <div className="text-xs text-gray-500">
                {annualPercent.toFixed(2)}% par an
              </div>
            </div>
            
            <div className="bg-green-50 p-5 rounded-lg border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Performance</span>
                <div className="bg-green-100 p-1.5 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-700 mb-1">
                +{annualPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-green-600">
                Sur l'investissement total
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-5 mt-4">
            <h3 className="text-sm font-semibold text-bgs-blue mb-4">Détail par projet</h3>
            
            <div className="overflow-hidden border border-gray-100 rounded-lg">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant investi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux mensuel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendement</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {investments.length > 0 ? (
                    investments.map((investment, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-bgs-blue">
                          {investment.projectName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {investment.amount.toLocaleString()} €
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {investment.monthlyRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                          {Math.round(investment.monthlyReturn)} €/mois
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                        Vous n'avez pas encore d'investissements actifs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

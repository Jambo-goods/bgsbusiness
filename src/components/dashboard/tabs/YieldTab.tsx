import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, TrendingUp, DollarSign, RefreshCw, AlertCircle, Clock, Check, PercentIcon, Calendar, ChevronRight, CheckCircle } from "lucide-react";
import { Project } from "@/types/project";
import { calculateExpectedCumulativeReturns } from "./investment-tracking/utils";
import ReturnProjectionSection from "./investment-tracking/ReturnProjectionSection";

const YieldTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [monthlyYield, setMonthlyYield] = useState(0);
  const [annualYield, setAnnualYield] = useState(0);
  const [annualPercent, setAnnualPercent] = useState(0);
  const [investments, setInvestments] = useState<{
    projectId: string;
    projectName: string;
    monthlyRate: number;
    amount: number;
    monthlyReturn: number;
  }[]>([]);
  const [userInvestments, setUserInvestments] = useState<Project[]>([]);
  const [hasShownNoInvestmentToast, setHasShownNoInvestmentToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Sample yield projection data
  const projectedYields = useMemo(() => {
    const baseMonthlyYield = 2000; // Example base monthly yield
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const randomVariation = Math.random() * 200 - 100; // Random variation between -100 and +100
      const monthlyYield = baseMonthlyYield + randomVariation;
      const cumulativeYield = baseMonthlyYield * month + randomVariation * (month / 2);
      
      return {
        month: `M${month}`,
        monthlyYield: Math.round(monthlyYield),
        cumulativeYield: Math.round(cumulativeYield)
      };
    });
  }, []);
  
  // Sample investment data
  const investmentData = useMemo(() => [
    { id: 1, name: "Projet Alpha", amount: 10000, yield: 12, monthlyReturn: 100 },
    { id: 2, name: "Projet Beta", amount: 5000, yield: 8, monthlyReturn: 33 },
    { id: 3, name: "Projet Gamma", amount: 15000, yield: 10, monthlyReturn: 125 }
  ], []);
  
  // Sample statistics
  const stats = useMemo(() => ({
    totalReceived: 1450,
    totalPending: 850,
    averageMonthlyReturn: 258,
    annualProjectedReturn: 3096
  }), []);
  
  // Sample upcoming payments
  const upcomingPayments = useMemo(() => [
    { id: "p1", date: new Date(2024, 5, 5), project: "Projet Alpha", amount: 100, cumulative: 350, status: "scheduled" },
    { id: "p2", date: new Date(2024, 6, 5), project: "Projet Beta", amount: 33, cumulative: 383, status: "scheduled" },
    { id: "p3", date: new Date(2024, 7, 5), project: "Projet Gamma", amount: 125, cumulative: 508, status: "scheduled" },
    { id: "p4", date: new Date(2024, 8, 5), project: "Projet Alpha", amount: 100, cumulative: 608, status: "scheduled" }
  ], []);

  useEffect(() => {
    fetchInvestmentYields();
    fetchUserInvestments();
    getUserId();
    
    const channel = supabase
      .channel('public:investments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        fetchInvestmentYields();
        fetchUserInvestments();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUserId = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session?.user?.id) {
        setUserId(sessionData.session.user.id);
      }
      
      setSessionChecked(true);
    } catch (error) {
      console.error("Error checking session:", error);
      setSessionChecked(true);
    }
  };

  const fetchUserInvestments = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user?.id) {
        console.log("No active session found");
        return;
      }
      
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          projects:project_id (
            id,
            name,
            image,
            company_name,
            status,
            yield
          )
        `)
        .eq('user_id', sessionData.session.user.id)
        .eq('status', 'active');
        
      if (error) {
        console.error("Error fetching user investments:", error);
        return;
      }
      
      const projects: Project[] = data.map(inv => ({
        id: inv.projects.id,
        name: inv.projects.name,
        image: inv.projects.image,
        companyName: inv.projects.company_name,
        status: 'active' as 'active' | 'upcoming' | 'completed',
        investedAmount: inv.amount,
        yield: inv.projects.yield,
        description: '',
        location: '',
        minInvestment: 0,
        maxInvestment: 0,
        price: 0,
        profitability: 0,
        duration: '12 months',
        category: '',
        fundingProgress: 0
      }));
      
      setUserInvestments(projects);
    } catch (error) {
      console.error("Error in fetchUserInvestments:", error);
    }
  };

  const fetchInvestmentYields = async () => {
    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error("Veuillez vous connecter pour accéder à vos rendements");
        return;
      }
      
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
        if (!hasShownNoInvestmentToast) {
          toast.info("Aucun investissement", {
            description: "Aucun investissement trouvé pour votre compte.",
            id: "no-investments-toast-yield"
          });
          setHasShownNoInvestmentToast(true);
        }
        return;
      }
      
      const projectIds = investmentsData.map(inv => inv.project_id);
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, yield')
        .in('id', projectIds);
        
      if (projectsError) {
        console.error("Erreur lors de la récupération des projets:", projectsError);
        throw projectsError;
      }
      
      const investmentsByProject = new Map();
      
      investmentsData.forEach(investment => {
        const project = projectsData?.find(p => p.id === investment.project_id);
        const projectId = investment.project_id;
        const monthlyRate = project?.yield || investment.yield_rate;
        
        if (investmentsByProject.has(projectId)) {
          const existingProject = investmentsByProject.get(projectId);
          existingProject.amount += investment.amount;
          existingProject.monthlyReturn += (monthlyRate / 100) * investment.amount;
        } else {
          investmentsByProject.set(projectId, {
            projectId: projectId,
            projectName: project?.name || 'Projet inconnu',
            monthlyRate: monthlyRate,
            amount: investment.amount,
            monthlyReturn: (monthlyRate / 100) * investment.amount
          });
        }
      });
      
      const groupedInvestments = Array.from(investmentsByProject.values());
      
      let totalMonthlyYield = 0;
      let weightedAnnualPercent = 0;
      let totalInvestment = 0;
      
      groupedInvestments.forEach(investment => {
        totalMonthlyYield += investment.monthlyReturn;
        weightedAnnualPercent += (investment.monthlyRate * 12) * investment.amount;
        totalInvestment += investment.amount;
      });
      
      const calculatedAnnualYield = totalMonthlyYield * 12;
      const calculatedAnnualPercent = totalInvestment > 0 
        ? (weightedAnnualPercent / totalInvestment) 
        : 0;
      
      setMonthlyYield(Math.round(totalMonthlyYield));
      setAnnualYield(Math.round(calculatedAnnualYield));
      setAnnualPercent(parseFloat(calculatedAnnualPercent.toFixed(2)));
      setInvestments(groupedInvestments);
      
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
    fetchUserInvestments();
  };

  const refreshData = () => {
    handleRefresh();
  };

  // Calculate total invested amount
  const totalInvestedAmount = userInvestments.reduce((sum, project) => {
    return sum + (project.investedAmount || 0);
  }, 0);

  return (
    <div className="space-y-6">
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
                        <tr key={investment.projectId} className="hover:bg-gray-50 transition-colors">
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
      
      {/* Yield Projection Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-50 p-2.5 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Projection de rendement</h2>
            <p className="text-xs text-gray-500 mt-0.5">Évolution prévue sur les 12 prochains mois</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 p-1.5 rounded-full mr-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-green-700">Total des versements perçus</p>
            </div>
            <p className="text-lg font-medium text-green-700">{stats.totalReceived.toFixed(2)} €</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center mb-2">
              <div className="bg-yellow-100 p-1.5 rounded-full mr-2">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-xs text-yellow-700">Total des versements en attente</p>
            </div>
            <p className="text-lg font-medium text-yellow-700">{stats.totalPending.toFixed(2)} €</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-blue-700">Rendement mensuel moyen</p>
            </div>
            <p className="text-lg font-medium text-blue-700">{stats.averageMonthlyReturn} €</p>
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Projections sur 12 mois</h3>
                <p className="text-sm text-blue-600">Évolution de vos rendements sur une année</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Mensuel</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Cumulé</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectedYields}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                <Tooltip 
                  formatter={(value, name) => {
                    return [`${value} €`, name === 'monthlyYield' ? 'Rendement mensuel' : 'Rendement cumulé'];
                  }}
                />
                <Legend 
                  payload={[
                    { value: 'Rendement mensuel', type: 'square', id: 'monthlyYield', color: '#3B82F6' },
                    { value: 'Rendement cumulé', type: 'square', id: 'cumulativeYield', color: '#10B981' },
                  ]}
                />
                <Bar yAxisId="left" dataKey="monthlyYield" fill="#3B82F6" name="Rendement mensuel" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="cumulativeYield" fill="#10B981" name="Rendement cumulé" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Rendement mensuel moyen</p>
              <p className="text-sm font-medium text-blue-600">{stats.averageMonthlyReturn} €</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Rendement annuel projeté</p>
              <p className="text-sm font-medium text-green-600">{stats.annualProjectedReturn} €</p>
            </div>
          </div>
        </div>
        
        {/* Investment Cards */}
        <h3 className="text-md font-semibold text-gray-800 mb-4">Détails de vos investissements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {investmentData.map(investment => (
            <div key={investment.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-600">{investment.name}</h4>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Actif</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500 mb-1">Montant investi</p>
                  <p className="font-medium">{investment.amount} €</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-xs text-gray-500 mb-1">Rendement</p>
                  <p className="font-medium text-green-600">{investment.yield}%</p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Revenu mensuel</p>
                  <p className="text-sm font-medium text-green-600">{investment.monthlyReturn} €</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Upcoming Payments Table */}
        <h3 className="text-md font-semibold text-gray-800 mb-4">Prochains versements prévus</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumul</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {payment.date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    {payment.project}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.amount} €
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                    {payment.cumulative} €
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Programmé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Ces projections sont basées sur les taux de rendement actuels de vos investissements et peuvent varier. 
            Les versements sont généralement effectués le 5 de chaque mois, après la période de délai initial spécifiée dans chaque projet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default YieldTab;

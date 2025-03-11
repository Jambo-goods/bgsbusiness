import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, TrendingUp, DollarSign, RefreshCw, AlertCircle, Clock, Check } from "lucide-react";
import FilterControls from "./investment-tracking/FilterControls";
import PaymentsTable from "./investment-tracking/PaymentsTable";
import ReturnsSummary from "./investment-tracking/ReturnsSummary";
import HeaderSection from "./investment-tracking/HeaderSection";
import LoadingIndicator from "./investment-tracking/LoadingIndicator";
import { useInvestmentTracking } from "./investment-tracking/useInvestmentTracking";
import { useReturnsStatistics } from "./investment-tracking/useReturnsStatistics";
import { useInvestmentSubscriptions } from "./investment-tracking/useInvestmentSubscriptions";
import { Project } from "@/types/project";

const YieldTab = () => {
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
  const [userInvestments, setUserInvestments] = useState<Project[]>([]);
  
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Project Alpha',
      image: '/placeholder.svg',
      companyName: 'Alpha Corporation',
      status: 'active',
      investedAmount: 5000,
      yield: 8,
      description: 'A sustainable energy project',
      location: 'Paris, France',
      minInvestment: 1000,
      maxInvestment: 50000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      category: 'energy',
      fundingProgress: 75
    },
    {
      id: '2',
      name: 'Project Beta',
      image: '/placeholder.svg',
      companyName: 'Beta Corporation',
      status: 'active',
      investedAmount: 3000,
      yield: 6,
      description: 'A renewable energy project',
      location: 'London, UK',
      minInvestment: 500,
      maxInvestment: 20000,
      startDate: '2023-06-01',
      endDate: '2023-12-31',
      category: 'renewable',
      fundingProgress: 90
    },
    {
      id: '3',
      name: 'Project Gamma',
      image: '/placeholder.svg',
      companyName: 'Gamma Corporation',
      status: 'active',
      investedAmount: 1000,
      yield: 4,
      description: 'A green building project',
      location: 'New York, USA',
      minInvestment: 200,
      maxInvestment: 10000,
      startDate: '2022-01-01',
      endDate: '2022-12-31',
      category: 'green',
      fundingProgress: 50
    }
  ];

  const {
    sortColumn,
    sortDirection,
    filterStatus,
    setFilterStatus,
    isLoading: trackingLoading,
    paymentRecords,
    animateRefresh: trackingRefresh,
    userId,
    handleSort,
    handleRefresh: refreshTracking
  } = useInvestmentTracking(userInvestments);
  
  const { statistics, isLoading: statsLoading } = useReturnsStatistics();
  
  useInvestmentSubscriptions(userId, refreshTracking);
  
  const isTrackingLoading = trackingLoading || statsLoading;
  const hasTrackingData = paymentRecords && paymentRecords.length > 0;

  useEffect(() => {
    fetchInvestmentYields();
    fetchUserInvestments();
    
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
        duration: '',
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
    fetchUserInvestments();
    refreshTracking();
  };

  const renderTrackingContent = () => {
    if (isTrackingLoading) {
      return <LoadingIndicator message="Chargement des données de rendement..." />;
    }
    
    if (!hasTrackingData || !statistics) {
      return (
        <div className="py-10 text-center">
          <div className="bg-blue-50 p-6 rounded-lg inline-block mb-4">
            <AlertCircle className="h-10 w-10 text-blue-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-bgs-blue mb-1">Aucun rendement trouvé</h3>
            <p className="text-sm text-bgs-gray-medium">
              Aucun investissement n'a été trouvé pour votre compte. <br />
              Investissez dans des projets pour voir apparaître vos rendements ici.
            </p>
          </div>
          <div>
            <button
              onClick={refreshTracking}
              className="text-bgs-blue hover:text-bgs-blue-dark flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Rafraîchir</span>
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <>
        <ReturnsSummary 
          totalPaid={statistics.totalPaid}
          totalPending={statistics.totalPending}
          averageMonthlyReturn={statistics.averageMonthlyReturn}
          isRefreshing={trackingRefresh}
          onRefresh={refreshTracking}
        />
        
        <PaymentsTable 
          filteredAndSortedPayments={statistics.filteredAndSortedPayments}
          scheduledPayments={statistics.paymentsWithCumulative}
          cumulativeReturns={statistics.cumulativeReturns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          handleSort={handleSort}
          userInvestments={userInvestments}
        />
      </>
    );
  };
  
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
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <HeaderSection 
            handleRefresh={refreshTracking}
            isLoading={isTrackingLoading}
            animateRefresh={trackingRefresh}
            dataSource="la base de données"
          />
          
          {hasTrackingData && (
            <FilterControls 
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          )}
        </div>
        
        {renderTrackingContent()}
      </div>
    </div>
  );
};

export default YieldTab;

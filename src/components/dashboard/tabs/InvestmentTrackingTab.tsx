
import React from "react";
import { Project } from "@/types/project";
import { AlertCircle, RefreshCcw } from "lucide-react";
import FilterControls from "./investment-tracking/FilterControls";
import PaymentsTable from "./investment-tracking/PaymentsTable";
import ReturnsSummary from "./investment-tracking/ReturnsSummary";
import HeaderSection from "./investment-tracking/HeaderSection";
import LoadingIndicator from "./investment-tracking/LoadingIndicator";
import { useInvestmentTracking } from "./investment-tracking/useInvestmentTracking";
import { useReturnsStatistics } from "./investment-tracking/useReturnsStatistics";
import { useInvestmentSubscriptions } from "./investment-tracking/useInvestmentSubscriptions";

interface InvestmentTrackingTabProps {
  userInvestments: Project[];
}

export default function InvestmentTrackingTab({ userInvestments }: InvestmentTrackingTabProps) {
  const {
    sortColumn,
    sortDirection,
    filterStatus,
    setFilterStatus,
    isLoading: investmentTracking,
    paymentRecords,
    animateRefresh,
    userId,
    handleSort,
    handleRefresh
  } = useInvestmentTracking(userInvestments);
  
  const { statistics, isLoading: statsLoading } = useReturnsStatistics();
  
  useInvestmentSubscriptions(userId, handleRefresh);
  
  const isLoading = investmentTracking || statsLoading;
  const hasData = paymentRecords && paymentRecords.length > 0;
  
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator message="Chargement des données de rendement..." />;
    }
    
    if (!hasData || !statistics) {
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
              onClick={handleRefresh}
              className="text-bgs-blue hover:text-bgs-blue-dark flex items-center gap-1 mx-auto"
            >
              <RefreshCcw className="h-4 w-4" />
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
          isRefreshing={animateRefresh}
          onRefresh={handleRefresh}
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
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <HeaderSection 
            handleRefresh={handleRefresh}
            isLoading={isLoading}
            animateRefresh={animateRefresh}
            dataSource="la base de données"
          />
          
          {hasData && (
            <FilterControls 
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          )}
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
}

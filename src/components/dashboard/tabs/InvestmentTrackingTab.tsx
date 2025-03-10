
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
    isLoading,
    paymentRecords,
    scheduledPayments,
    animateRefresh,
    userId,
    handleSort,
    handleRefresh
  } = useInvestmentTracking(userInvestments);
  
  const {
    totalPaid,
    totalPending,
    averageMonthlyReturn
  } = useReturnsStatistics(paymentRecords, filterStatus, sortColumn, sortDirection);
  
  useInvestmentSubscriptions(userId, handleRefresh);
  
  // Sort scheduled payments according to the selected criteria, but don't filter
  const sortedScheduledPayments = React.useMemo(() => {
    return [...scheduledPayments]
      .sort((a, b) => {
        if (sortColumn === 'date') {
          return sortDirection === 'asc' 
            ? new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime() 
            : new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
        } else if (sortColumn === 'amount') {
          return sortDirection === 'asc' 
            ? Number(a.total_scheduled_amount) - Number(b.total_scheduled_amount) 
            : Number(b.total_scheduled_amount) - Number(a.total_scheduled_amount);
        } else if (sortColumn === 'projectName') {
          const nameA = a.project?.name || '';
          const nameB = b.project?.name || '';
          return sortDirection === 'asc'
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        } else if (sortColumn === 'investors') {
          return sortDirection === 'asc'
            ? (a.investors_count || 0) - (b.investors_count || 0)
            : (b.investors_count || 0) - (a.investors_count || 0);
        }
        return 0;
      });
  }, [scheduledPayments, sortColumn, sortDirection]);
  
  const hasData = scheduledPayments && scheduledPayments.length > 0;
  
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator message="Chargement des données de versements..." />;
    }
    
    if (!hasData) {
      return (
        <div className="py-10 text-center">
          <div className="bg-blue-50 p-6 rounded-lg inline-block mb-4">
            <AlertCircle className="h-10 w-10 text-blue-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-bgs-blue mb-1">Aucun versement trouvé</h3>
            <p className="text-sm text-bgs-gray-medium">
              Aucun versement programmé n'a été trouvé. <br />
              Veuillez vérifier ultérieurement.
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
          totalPaid={totalPaid}
          totalPending={totalPending}
          averageMonthlyReturn={averageMonthlyReturn}
          isRefreshing={animateRefresh}
          onRefresh={handleRefresh}
        />
        
        <PaymentsTable 
          scheduledPayments={sortedScheduledPayments}
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

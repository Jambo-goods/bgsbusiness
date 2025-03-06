
import React from "react";
import { Project } from "@/types/project";
import FilterControls from "./investment-tracking/FilterControls";
import ReturnsSummary from "./investment-tracking/ReturnsSummary";
import PaymentsTable from "./investment-tracking/PaymentsTable";
import LoadingIndicator from "./investment-tracking/LoadingIndicator";
import HeaderSection from "./investment-tracking/HeaderSection";
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
    animateRefresh,
    userId,
    handleSort,
    handleRefresh
  } = useInvestmentTracking(userInvestments);
  
  const {
    cumulativeReturns,
    filteredAndSortedPayments,
    totalPaid,
    totalPending,
    averageMonthlyReturn
  } = useReturnsStatistics(paymentRecords, filterStatus, sortColumn, sortDirection);
  
  // Set up real-time subscriptions
  useInvestmentSubscriptions(userId, handleRefresh);
  
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <HeaderSection 
            handleRefresh={handleRefresh}
            isLoading={isLoading}
            animateRefresh={animateRefresh}
          />
          
          <FilterControls 
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </div>
        
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <>
            <ReturnsSummary 
              totalPaid={totalPaid}
              totalPending={totalPending}
              averageMonthlyReturn={averageMonthlyReturn}
              isRefreshing={animateRefresh}
              onRefresh={handleRefresh}
            />
            
            <PaymentsTable 
              filteredAndSortedPayments={filteredAndSortedPayments}
              cumulativeReturns={cumulativeReturns}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              handleSort={handleSort}
              userInvestments={userInvestments}
            />
          </>
        )}
      </div>
    </div>
  );
}

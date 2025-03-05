
import React, { useState } from "react";
import { Project } from "@/types/project";
import FilterControls from "./investment-tracking/FilterControls";
import ReturnsSummary from "./investment-tracking/ReturnsSummary";
import PaymentsTable from "./investment-tracking/PaymentsTable";
import { 
  generatePayments, 
  calculateCumulativeReturns, 
  filterAndSortPayments 
} from "./investment-tracking/utils";

interface InvestmentTrackingTabProps {
  userInvestments: Project[];
}

export default function InvestmentTrackingTab({ userInvestments }: InvestmentTrackingTabProps) {
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Generate sample payment records based on user investments
  const [paymentRecords] = useState(generatePayments(userInvestments));
  
  // Calculate cumulative returns
  const cumulativeReturns = calculateCumulativeReturns(paymentRecords);
  
  // Filter and sort payment records
  const filteredAndSortedPayments = filterAndSortPayments(
    paymentRecords,
    filterStatus,
    sortColumn,
    sortDirection
  );
  
  // Toggle sort direction when clicking on a column header
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Calculate total returns
  const totalPaid = paymentRecords
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPending = paymentRecords
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate average monthly return
  const averageMonthlyReturn = Math.round(
    totalPaid / Math.max(cumulativeReturns.length, 1)
  );
  
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-lg font-medium text-bgs-blue">
            Suivi des rendements
          </h2>
          
          <FilterControls 
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </div>
        
        <ReturnsSummary 
          totalPaid={totalPaid}
          totalPending={totalPending}
          averageMonthlyReturn={averageMonthlyReturn}
        />
        
        <PaymentsTable 
          filteredAndSortedPayments={filteredAndSortedPayments}
          cumulativeReturns={cumulativeReturns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          handleSort={handleSort}
          userInvestments={userInvestments}
        />
      </div>
    </div>
  );
}

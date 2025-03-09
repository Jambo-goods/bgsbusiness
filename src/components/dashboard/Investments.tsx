
import React, { useEffect, useState } from "react";
import { Project } from "@/types/project";
import SearchAndFilterControls from "./investments/SearchAndFilterControls";
import InvestmentItem from "./investments/InvestmentItem";
import InvestmentListStatus from "./investments/InvestmentListStatus";
import { useInvestmentsData } from "./investments/useInvestmentsData";

interface InvestmentsProps {
  userInvestments: Project[];
}

export default function Investments({ userInvestments }: InvestmentsProps) {
  const {
    isLoading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filterActive,
    setFilterActive,
    showSortMenu,
    setShowSortMenu,
    filteredInvestments
  } = useInvestmentsData();
  
  const [investmentTotal, setInvestmentTotal] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate total investment amount when userInvestments changes
  useEffect(() => {
    const total = userInvestments.reduce((total, investment) => 
      total + (investment.amount || 0), 0);
    setInvestmentTotal(total);
  }, [userInvestments]);

  // Real-time subscription removed

  return (
    <div className="space-y-4">
      {/* Main Investments List */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-base font-medium text-bgs-blue">
            Mes investissements
          </h2>
          
          <SearchAndFilterControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterActive={filterActive}
            setFilterActive={setFilterActive}
            showSortMenu={showSortMenu}
            setShowSortMenu={setShowSortMenu}
            setSortBy={setSortBy}
          />
        </div>
        
        <div className="space-y-3">
          <InvestmentListStatus 
            isLoading={isLoading} 
            isEmpty={filteredInvestments.length === 0} 
          />
          
          {!isLoading && filteredInvestments.length > 0 && (
            filteredInvestments.map((investment) => (
              <InvestmentItem key={investment.id} investment={investment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

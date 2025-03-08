
import React from "react";
import { Project } from "@/types/project";
import SearchAndFilterControls from "./investments/SearchAndFilterControls";
import InvestmentItem from "./investments/InvestmentItem";
import InvestmentListStatus from "./investments/InvestmentListStatus";
import { useInvestmentsData } from "./investments/useInvestmentsData";
import { Card } from "@/components/ui/card";

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

  // Calculate total investment amount
  const investmentTotal = userInvestments.reduce((total, investment) => 
    total + (investment.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Capital Investment Summary Card */}
      <Card className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-bgs-blue mb-2">Capital investi</h2>
        <p className="text-3xl font-bold text-bgs-blue mb-2">{investmentTotal.toLocaleString()} €</p>
        <p className="text-sm text-bgs-gray-medium mb-2">Montant total investi dans les projets actifs.</p>
        {userInvestments.length === 0 && (
          <p className="text-sm text-bgs-gray-medium mt-3">Aucun investissement actif.</p>
        )}
      </Card>

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

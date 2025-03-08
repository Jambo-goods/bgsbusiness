
import React, { useEffect, useState } from "react";
import { Project } from "@/types/project";
import SearchAndFilterControls from "./investments/SearchAndFilterControls";
import InvestmentItem from "./investments/InvestmentItem";
import InvestmentListStatus from "./investments/InvestmentListStatus";
import { useInvestmentsData } from "./investments/useInvestmentsData";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

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

  // Set up real-time subscription for investments
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData && sessionData.session) {
          const userId = sessionData.session.user.id;
          
          const channel = supabase
            .channel('investments_total_changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'investments',
              filter: `user_id=eq.${userId}`
            }, (payload) => {
              // Show updating indicator
              setIsUpdating(true);
              
              // Recalculate total after data change
              // Note: In a production app, you might want to fetch the latest data
              // instead of relying on the local state
              const updatedTotal = userInvestments.reduce((total, investment) => 
                total + (investment.amount || 0), 0);
              setInvestmentTotal(updatedTotal);
              
              // Reset indicator after animation completes
              setTimeout(() => {
                setIsUpdating(false);
              }, 2000);
            })
            .subscribe();
            
          return () => {
            supabase.removeChannel(channel);
          };
        }
      } catch (error) {
        console.error("Error setting up real-time subscription:", error);
      }
    };
    
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn) cleanupFn();
        });
      }
    };
  }, [userInvestments]);

  return (
    <div className="space-y-4">
      {/* Capital Investment Summary Card */}
      <Card className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-bgs-blue mb-2">Capital investi</h2>
        <div className="flex items-center">
          <p className="text-3xl font-bold text-bgs-blue mb-2">{investmentTotal.toLocaleString()} €</p>
          {isUpdating && (
            <span className="ml-2 h-2 w-2 rounded-full bg-bgs-orange animate-pulse"></span>
          )}
        </div>
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

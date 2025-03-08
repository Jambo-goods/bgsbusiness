
import React, { useState, useEffect } from "react";
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

  // State for real-time investment total
  const [investmentTotal, setInvestmentTotal] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate and update investment total amount
  useEffect(() => {
    // Initial calculation from props
    const calculateTotal = () => {
      const total = userInvestments.reduce((total, investment) => 
        total + (investment.amount || 0), 0);
      setInvestmentTotal(total);
    };
    
    calculateTotal();
    
    // Set up real-time subscription for investments updates
    const { data: user } = supabase.auth.getSession();
    
    user.then(userData => {
      if (userData.session?.user) {
        const userId = userData.session.user.id;
        
        // Subscribe to changes on the investments table for this user
        const investmentsChannel = supabase
          .channel('investments_total_updates')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'investments',
            filter: `user_id=eq.${userId}`
          }, () => {
            // When investment data changes, show updating state
            setIsUpdating(true);
            
            // Fetch the latest data to recalculate total
            fetchLatestInvestmentTotal(userId);
          })
          .subscribe();
          
        return () => {
          supabase.removeChannel(investmentsChannel);
        };
      }
    });
  }, [userInvestments]);
  
  // Function to fetch latest investment total directly from database
  const fetchLatestInvestmentTotal = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('amount')
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error fetching investment total:", error);
        return;
      }
      
      // Calculate new total
      const newTotal = (data || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);
      
      // Update state with new total
      setInvestmentTotal(newTotal);
    } catch (error) {
      console.error("Error calculating investment total:", error);
    } finally {
      // Hide updating state
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Capital Investment Summary Card */}
      <Card className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-bgs-blue mb-2">Capital investi</h2>
        <div className="relative">
          <p className="text-3xl font-bold text-bgs-blue mb-2">
            {investmentTotal.toLocaleString()} €
            {isUpdating && (
              <span className="ml-2 inline-block h-2 w-2 rounded-full bg-bgs-orange animate-pulse" 
                    title="Mise à jour en cours"></span>
            )}
          </p>
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


import React, { useState, useEffect } from "react";
import { Project } from "@/types/project";
import FilterControls from "./investment-tracking/FilterControls";
import ReturnsSummary from "./investment-tracking/ReturnsSummary";
import PaymentsTable from "./investment-tracking/PaymentsTable";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  generatePayments, 
  calculateCumulativeReturns, 
  filterAndSortPayments,
  fetchRealTimeInvestmentData,
  generatePaymentsFromRealData
} from "./investment-tracking/utils";

interface InvestmentTrackingTabProps {
  userInvestments: Project[];
}

export default function InvestmentTrackingTab({ userInvestments }: InvestmentTrackingTabProps) {
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRecords, setPaymentRecords] = useState(generatePayments(userInvestments));
  const [animateRefresh, setAnimateRefresh] = useState(false);
  const [realInvestments, setRealInvestments] = useState<any[]>([]);
  
  // Calculate cumulative returns
  const cumulativeReturns = calculateCumulativeReturns(paymentRecords);
  
  // Filter and sort payment records
  const filteredAndSortedPayments = filterAndSortPayments(
    paymentRecords,
    filterStatus,
    sortColumn,
    sortDirection
  );
  
  useEffect(() => {
    loadRealTimeData();
    
    // Set up real-time subscriptions
    const investmentChannel = supabase
      .channel('investment_tracking_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, (payload) => {
        console.log('Investment data changed, refreshing tracking tab...', payload);
        toast.info("Mise à jour des investissements", {
          description: "Les données de suivi sont en cours d'actualisation."
        });
        loadRealTimeData();
      })
      .subscribe();
      
    // Wallet transactions could affect yields
    const walletChannel = supabase
      .channel('wallet_tracking_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, (payload) => {
        console.log('Wallet transaction detected, refreshing tracking...', payload);
        toast.info("Transaction détectée", {
          description: "Les données de rendement sont en cours d'actualisation."
        });
        loadRealTimeData();
      })
      .subscribe();
      
    return () => {
      console.log("Cleaning up investment tracking subscriptions");
      supabase.removeChannel(investmentChannel);
      supabase.removeChannel(walletChannel);
    };
  }, []);
  
  const loadRealTimeData = async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log("No active session found for investment tracking");
        // Fall back to sample data for unauthenticated users
        setPaymentRecords(generatePayments(userInvestments));
        return;
      }
      
      const userId = session.session.user.id;
      const investments = await fetchRealTimeInvestmentData(userId);
      
      setRealInvestments(investments);
      
      if (investments && investments.length > 0) {
        // Use real investment data to generate payment records
        const realPayments = generatePaymentsFromRealData(investments);
        setPaymentRecords(realPayments);
        console.log("Updated payment records with real-time data:", realPayments.length);
      } else {
        // Fall back to sample data if no real investments found
        setPaymentRecords(generatePayments(userInvestments));
        console.log("No real investments found, using sample data");
      }
    } catch (error) {
      console.error("Error loading real-time investment data:", error);
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données de rendement en temps réel."
      });
      // Fall back to sample data on error
      setPaymentRecords(generatePayments(userInvestments));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle sort direction when clicking on a column header
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    setAnimateRefresh(true);
    loadRealTimeData();
    setTimeout(() => setAnimateRefresh(false), 1000);
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
          <h2 className="text-lg font-medium text-bgs-blue flex items-center gap-2">
            Suivi des rendements
            <button 
              onClick={handleRefresh}
              className="text-gray-500 hover:text-bgs-blue transition-colors"
              title="Rafraîchir les données"
            >
              <RefreshCcw 
                className={`h-4 w-4 ${animateRefresh ? 'animate-spin' : ''}`} 
              />
            </button>
          </h2>
          
          <FilterControls 
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </div>
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bgs-orange"></div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

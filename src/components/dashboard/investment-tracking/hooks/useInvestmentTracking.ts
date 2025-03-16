
import { useState, useEffect, useCallback } from "react";
import { Investment, Transaction } from "../types/investment";
import { fetchInvestmentDetails, fetchTransactionHistory } from "../utils/fetchInvestmentData";

export function useInvestmentTracking(investmentId: string | undefined) {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      if (!investmentId) {
        return;
      }
      
      try {
        // Fetch investment details directly
        const investmentData = await fetchInvestmentDetails(investmentId);
        
        if (investmentData) {
          setInvestment(investmentData);
          
          // Once we have the investment data, fetch transactions for this user
          try {
            const transactionsData = await fetchTransactionHistory(investmentData.user_id);
            setTransactions(transactionsData);
          } catch (transactionError) {
            console.error("Error loading transaction history:", transactionError);
            setTransactions([]);
          }
        }
      } catch (error) {
        console.error("Error loading investment tracking data:", error);
      }
    };
    
    loadData();
  }, [investmentId]);

  // Function to refresh data
  const refreshData = async () => {
    if (!investmentId || !investment) return;
    
    try {
      setIsRefreshing(true);
      
      const refreshedInvestment = await fetchInvestmentDetails(investmentId);
      
      if (refreshedInvestment) {
        setInvestment(refreshedInvestment);
        
        // Refresh transactions data
        const refreshedTransactions = await fetchTransactionHistory(refreshedInvestment.user_id);
        setTransactions(refreshedTransactions);
      }
    } catch (error) {
      console.error("Error refreshing investment data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    investment,
    transactions,
    isRefreshing,
    refreshData
  };
}

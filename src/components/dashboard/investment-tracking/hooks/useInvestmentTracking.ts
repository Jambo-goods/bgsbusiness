
import { useState, useEffect } from "react";
import { Investment, Transaction } from "../types/investment";
import { fetchInvestmentDetails, fetchTransactionHistory } from "../utils/fetchInvestmentData";

export function useInvestmentTracking(investmentId: string | undefined) {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null);

  // Function to safely set loading state with debounce
  const setLoadingWithDebounce = (isLoading: boolean) => {
    // Clear any existing timer
    if (loadingTimer) {
      clearTimeout(loadingTimer);
    }
    
    if (isLoading) {
      // Set loading to true immediately
      setLoading(true);
    } else {
      // Delay setting loading to false to prevent flickering
      const timer = setTimeout(() => {
        setLoading(false);
      }, 300); // 300ms debounce
      setLoadingTimer(timer);
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      if (!investmentId) return;
      
      try {
        setLoadingWithDebounce(true);
        const investmentData = await fetchInvestmentDetails(investmentId);
        
        if (investmentData) {
          setInvestment(investmentData);
          
          // Once we have the investment data, fetch transactions for this user
          const transactionsData = await fetchTransactionHistory(investmentData.user_id);
          setTransactions(transactionsData);
        }
      } catch (error) {
        console.error("Error loading investment tracking data:", error);
      } finally {
        setLoadingWithDebounce(false);
      }
    };
    
    loadData();
    
    // Cleanup timer on unmount
    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
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
    loading,
    isRefreshing,
    refreshData
  };
}


import { useState, useEffect, useRef } from "react";
import { Investment, Transaction } from "../types/investment";
import { fetchInvestmentDetails, fetchTransactionHistory } from "../utils/fetchInvestmentData";

export function useInvestmentTracking(investmentId: string | undefined) {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);
  const maxAttempts = 3;

  // Function to safely set loading state with debounce
  const setLoadingWithDebounce = (isLoading: boolean) => {
    // Clear any existing timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    if (isLoading) {
      // Set loading to true immediately
      setLoading(true);
    } else {
      // Delay setting loading to false to prevent flickering
      loadingTimerRef.current = setTimeout(() => {
        setLoading(false);
        loadingTimerRef.current = null;
      }, 800); // 800ms debounce for better stability
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      if (!investmentId) {
        setLoadingWithDebounce(false);
        return;
      }
      
      try {
        setLoadingWithDebounce(true);
        attemptCountRef.current += 1;
        console.log(`Fetching investment data, attempt ${attemptCountRef.current}/${maxAttempts}`);
        
        const investmentData = await fetchInvestmentDetails(investmentId);
        
        if (investmentData) {
          setInvestment(investmentData);
          
          // Once we have the investment data, fetch transactions for this user
          const transactionsData = await fetchTransactionHistory(investmentData.user_id);
          setTransactions(transactionsData);
          
          // Reset attempt counter on success
          attemptCountRef.current = 0;
        } else if (attemptCountRef.current < maxAttempts) {
          // Retry after a delay if within max attempts
          setTimeout(loadData, 2000);
          return;
        }
      } catch (error) {
        console.error("Error loading investment tracking data:", error);
        
        if (attemptCountRef.current < maxAttempts) {
          // Retry after a delay if within max attempts
          setTimeout(loadData, 2000);
          return;
        }
      } finally {
        // Only turn off loading state if we're done with attempts or succeeded
        if (attemptCountRef.current >= maxAttempts || investment) {
          setLoadingWithDebounce(false);
        }
      }
    };
    
    loadData();
    
    // Cleanup timer on unmount
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
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

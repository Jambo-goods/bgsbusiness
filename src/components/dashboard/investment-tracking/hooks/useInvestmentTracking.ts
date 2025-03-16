
import { useState, useEffect, useRef, useCallback } from "react";
import { Investment, Transaction } from "../types/investment";
import { fetchInvestmentDetails, fetchTransactionHistory } from "../utils/fetchInvestmentData";
import { toast } from "sonner";

export function useInvestmentTracking(investmentId: string | undefined) {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(0);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);
  const maxAttempts = 3;

  // Function to safely set loading state with debounce
  const setLoadingWithDebounce = useCallback((isLoading: boolean) => {
    // Clear any existing timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    if (isLoading) {
      // Set loading to true immediately
      setLoading(true);
      
      // Start a timeout counter to track loading duration
      if (timeoutTimerRef.current) {
        clearInterval(timeoutTimerRef.current);
      }
      
      let seconds = 0;
      timeoutTimerRef.current = setInterval(() => {
        seconds += 1;
        setLoadingTimeout(seconds);
        
        // Show a toast notification if loading takes too long
        if (seconds === 20) {
          toast.info("Chargement prolongé", {
            description: "Le chargement prend plus de temps que prévu. Veuillez patienter..."
          });
        }
      }, 1000);
    } else {
      // Delay setting loading to false to prevent flickering
      loadingTimerRef.current = setTimeout(() => {
        setLoading(false);
        setLoadingTimeout(0);
        loadingTimerRef.current = null;
        
        // Clear timeout counter
        if (timeoutTimerRef.current) {
          clearInterval(timeoutTimerRef.current);
          timeoutTimerRef.current = null;
        }
      }, 800); // 800ms debounce for better stability
    }
  }, []);

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
        
        // Force timeout after 30 seconds to prevent infinite loading
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("Fetch timeout")), 30000)
        );
        
        // Fetch data with timeout protection
        const investmentData = await Promise.race([
          fetchInvestmentDetails(investmentId),
          timeoutPromise
        ]);
        
        if (investmentData) {
          setInvestment(investmentData);
          
          // Once we have the investment data, fetch transactions for this user
          try {
            const transactionsData = await fetchTransactionHistory(investmentData.user_id);
            setTransactions(transactionsData);
          } catch (transactionError) {
            console.error("Error loading transaction history:", transactionError);
            setTransactions([]);
            // Don't fail completely if just transactions fail
          }
          
          // Reset attempt counter on success
          attemptCountRef.current = 0;
        } else if (attemptCountRef.current < maxAttempts) {
          // Retry after a delay if within max attempts
          setTimeout(loadData, 2000);
          return;
        } else {
          // Max attempts reached, show fallback state
          toast.error("Erreur de chargement", {
            description: "Impossible de charger les données d'investissement après plusieurs tentatives"
          });
        }
      } catch (error) {
        console.error("Error loading investment tracking data:", error);
        
        if (attemptCountRef.current < maxAttempts) {
          // Retry after a delay if within max attempts
          setTimeout(loadData, 2000);
          return;
        } else {
          // Max attempts reached, show error
          toast.error("Erreur de chargement", {
            description: "Impossible de charger les données d'investissement. Veuillez réessayer plus tard."
          });
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
      if (timeoutTimerRef.current) {
        clearInterval(timeoutTimerRef.current);
      }
    };
  }, [investmentId, setLoadingWithDebounce, investment]);

  // Function to refresh data
  const refreshData = async () => {
    if (!investmentId || !investment) return;
    
    try {
      setIsRefreshing(true);
      attemptCountRef.current = 0; // Reset attempt counter
      
      const refreshedInvestment = await fetchInvestmentDetails(investmentId);
      
      if (refreshedInvestment) {
        setInvestment(refreshedInvestment);
        
        // Refresh transactions data
        const refreshedTransactions = await fetchTransactionHistory(refreshedInvestment.user_id);
        setTransactions(refreshedTransactions);
        
        toast.success("Données actualisées", {
          description: "Les données d'investissement ont été actualisées avec succès"
        });
      }
    } catch (error) {
      console.error("Error refreshing investment data:", error);
      toast.error("Erreur d'actualisation", {
        description: "Impossible d'actualiser les données d'investissement"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    investment,
    transactions,
    loading,
    loadingTimeout,
    isRefreshing,
    refreshData
  };
}

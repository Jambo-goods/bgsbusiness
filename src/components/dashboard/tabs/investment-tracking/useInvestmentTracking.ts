
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { PaymentRecord } from "./types";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";
import { 
  fetchRealTimeInvestmentData,
  generatePaymentsFromRealData
} from "./utils";

export const useInvestmentTracking = (userInvestments: Project[]) => {
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [animateRefresh, setAnimateRefresh] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasShownNoInvestmentToast, setHasShownNoInvestmentToast] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadAttemptRef = useRef(0);
  const maxLoadAttempts = 3;
  
  // Function to safely set loading state with debounce to prevent flickering
  const setLoadingWithDebounce = (isLoading: boolean) => {
    // Clear any existing timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    if (isLoading) {
      // Set loading to true immediately
      setIsLoading(true);
    } else {
      // Delay setting loading to false to prevent flickering
      loadingTimerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 800); // 800ms debounce to ensure stability
    }
  };
  
  const loadRealTimeData = useCallback(async () => {
    setLoadingWithDebounce(true);
    try {
      console.log("Fetching investment data...");
      loadAttemptRef.current += 1;
      
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log("No active session found for investment tracking");
        toast.error("Pas de session active", {
          description: "Connectez-vous pour voir vos données."
        });
        setPaymentRecords([]);
        setLoadingWithDebounce(false);
        return;
      }
      
      const currentUserId = session.session.user.id;
      setUserId(currentUserId);
      console.log("Using user ID for investment tracking:", currentUserId);
      
      const investments = await fetchRealTimeInvestmentData(currentUserId);
      
      console.log("Fetched investments:", investments?.length || 0);
      
      if (investments && investments.length > 0) {
        // Use investment data to generate payment records
        const realPayments = generatePaymentsFromRealData(investments);
        
        // Check if there are any new payments since last check
        if (paymentRecords.length > 0) {
          const newPayments = realPayments.filter(
            newPayment => 
              newPayment.status === 'paid' && 
              !paymentRecords.some(
                oldPayment => 
                  oldPayment.id === newPayment.id && 
                  oldPayment.status === 'paid'
              )
          );
          
          // Notify user of new payments
          newPayments.forEach(payment => {
            try {
              notificationService.yieldReceived(
                payment.amount, 
                payment.projectName || "votre investissement"
              );
            } catch (error) {
              console.error("Error sending notification:", error);
            }
          });
        }
        
        setPaymentRecords(realPayments);
        setHasShownNoInvestmentToast(false);
        loadAttemptRef.current = 0; // Reset attempt counter on success
        console.log("Updated payment records with data:", realPayments.length);
      } else {
        // No investments found
        console.log("No investments found");
        setPaymentRecords([]);
        
        // Only show the toast once per session to avoid repeated notifications
        if (!hasShownNoInvestmentToast) {
          toast.info("Aucun investissement", {
            description: "Aucun investissement trouvé pour votre compte.",
            id: "no-investments-toast" // Add an ID to prevent duplicates
          });
          setHasShownNoInvestmentToast(true);
        }
      }
    } catch (error) {
      console.error("Error loading investment data:", error);
      
      // Retry up to max attempts
      if (loadAttemptRef.current < maxLoadAttempts) {
        console.log(`Retrying data load (attempt ${loadAttemptRef.current}/${maxLoadAttempts})...`);
        setTimeout(loadRealTimeData, 1500); // Retry after 1.5 seconds
        return;
      }
      
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données de rendement."
      });
      setPaymentRecords([]);
    } finally {
      // Only turn off loading if we're done with attempts or succeeded
      if (loadAttemptRef.current >= maxLoadAttempts || paymentRecords.length > 0) {
        setTimeout(() => {
          setLoadingWithDebounce(false);
          setAnimateRefresh(false);
        }, 500);
      }
    }
  }, [paymentRecords, hasShownNoInvestmentToast]);
  
  useEffect(() => {
    loadRealTimeData();
    
    // Set up manual refresh interval instead of real-time subscription
    const refreshInterval = setInterval(() => {
      console.log("Running scheduled data refresh...");
      loadRealTimeData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
      // Clean up any existing loading timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [loadRealTimeData]);
  
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
    console.log("Manual refresh requested");
    setAnimateRefresh(true);
    // Reset attempt counter for manual refresh
    loadAttemptRef.current = 0;
    loadRealTimeData();
  };
  
  return {
    sortColumn,
    sortDirection,
    filterStatus,
    setFilterStatus,
    isLoading,
    paymentRecords,
    animateRefresh,
    userId,
    handleSort,
    handleRefresh
  };
};

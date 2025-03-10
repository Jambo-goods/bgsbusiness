
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { PaymentRecord, ScheduledPayment } from "./types";
import { toast } from "sonner";
import { 
  fetchRealTimeInvestmentData,
  fetchScheduledPayments,
  generatePaymentsFromRealData
} from "./utils";

export const useInvestmentTracking = (userInvestments: Project[]) => {
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [animateRefresh, setAnimateRefresh] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const loadRealTimeData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching investment data...");
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log("No active session found for investment tracking");
        toast.error("Pas de session active", {
          description: "Connectez-vous pour voir vos données."
        });
        setPaymentRecords([]);
        return;
      }
      
      const currentUserId = session.session.user.id;
      setUserId(currentUserId);
      console.log("Using user ID for investment tracking:", currentUserId);
      
      // Fetch investments
      const investments = await fetchRealTimeInvestmentData(currentUserId);
      console.log("Fetched investments:", investments.length);
      
      // Fetch scheduled payments (now without user_id filter)
      const scheduledPaymentsData = await fetchScheduledPayments();
      setScheduledPayments(scheduledPaymentsData);
      console.log("Fetched scheduled payments:", scheduledPaymentsData.length);
      
      if (investments && investments.length > 0) {
        // Use investment data and scheduled payments to generate payment records
        const realPayments = generatePaymentsFromRealData(investments, scheduledPaymentsData);
        setPaymentRecords(realPayments);
        console.log("Updated payment records with data:", realPayments.length);
      } else if (scheduledPaymentsData && scheduledPaymentsData.length > 0) {
        // Only use scheduled payments if no investments
        const scheduledRecords = generatePaymentsFromRealData([], scheduledPaymentsData);
        setPaymentRecords(scheduledRecords);
        console.log("Updated payment records with only scheduled payments:", scheduledRecords.length);
      } else {
        // No investments or scheduled payments found
        console.log("No investments or scheduled payments found");
        setPaymentRecords([]);
        toast.info("Aucune donnée", {
          description: "Aucun investissement ou versement programmé trouvé."
        });
      }
    } catch (error) {
      console.error("Error loading investment data:", error);
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données de rendement."
      });
      setPaymentRecords([]);
    } finally {
      setIsLoading(false);
      setAnimateRefresh(false);
    }
  }, []);
  
  useEffect(() => {
    loadRealTimeData();
    
    // Set up subscription for real-time updates to scheduled_payments
    const scheduledPaymentsSubscription = supabase
      .channel('scheduled_payments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scheduled_payments'
      }, () => {
        console.log("Scheduled payments changed, refreshing data...");
        loadRealTimeData();
      })
      .subscribe();
    
    // Set up manual refresh interval as a backup
    const refreshInterval = setInterval(() => {
      console.log("Running scheduled data refresh...");
      loadRealTimeData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
      scheduledPaymentsSubscription.unsubscribe();
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
    loadRealTimeData();
  };
  
  return {
    sortColumn,
    sortDirection,
    filterStatus,
    setFilterStatus,
    isLoading,
    paymentRecords,
    scheduledPayments,
    animateRefresh,
    userId,
    handleSort,
    handleRefresh
  };
};

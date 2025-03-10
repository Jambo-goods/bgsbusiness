
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { PaymentRecord, ScheduledPayment, DatabaseSyncStatus } from "./types";
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
  const [syncStatus, setSyncStatus] = useState<DatabaseSyncStatus>({
    lastSynced: null,
    isError: false,
    errorMessage: null
  });
  
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
        setScheduledPayments([]);
        setSyncStatus({
          lastSynced: null,
          isError: true,
          errorMessage: "Pas de session active"
        });
        return;
      }
      
      const currentUserId = session.session.user.id;
      setUserId(currentUserId);
      
      // Fetch ALL scheduled payments with fresh data from the database
      const scheduledPaymentsData = await fetchScheduledPayments();
      setScheduledPayments(scheduledPaymentsData);
      console.log("Fetched scheduled payments:", scheduledPaymentsData.length);
      
      // Then get user investments for additional data
      const investments = await fetchRealTimeInvestmentData(currentUserId);
      console.log("Fetched investments:", investments.length);
      
      // Generate combined payment records
      const realPayments = generatePaymentsFromRealData(investments, scheduledPaymentsData);
      setPaymentRecords(realPayments);
      console.log("Updated payment records with data:", realPayments.length);
      
      // Update sync status
      setSyncStatus({
        lastSynced: new Date(),
        isError: false,
        errorMessage: null
      });
      
      toast.success("Données synchronisées", {
        description: "Les données de versement ont été mises à jour."
      });
      
    } catch (error) {
      console.error("Error loading investment data:", error);
      toast.error("Erreur de synchronisation", {
        description: "Impossible de charger les données de versement."
      });
      setPaymentRecords([]);
      setScheduledPayments([]);
      setSyncStatus({
        lastSynced: new Date(),
        isError: true,
        errorMessage: error instanceof Error ? error.message : "Erreur inconnue"
      });
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
    
    // Set up subscription for real-time updates to investments
    const investmentsSubscription = supabase
      .channel('investments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        console.log("Investments changed, refreshing data...");
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
      investmentsSubscription.unsubscribe();
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
    syncStatus,
    handleSort,
    handleRefresh
  };
};

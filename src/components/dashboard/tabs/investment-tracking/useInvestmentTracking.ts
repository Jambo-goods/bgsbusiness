
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { PaymentRecord } from "./types";
import { toast } from "sonner";
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
  const [realInvestments, setRealInvestments] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  const loadRealTimeData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching investment data for real-time updates...");
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
      
      const investments = await fetchRealTimeInvestmentData(currentUserId);
      
      setRealInvestments(investments);
      console.log("Fetched real investments:", investments.length);
      
      if (investments && investments.length > 0) {
        // Use real investment data to generate payment records
        const realPayments = generatePaymentsFromRealData(investments);
        setPaymentRecords(realPayments);
        console.log("Updated payment records with real-time data:", realPayments.length);
        toast.success("Données mises à jour", {
          description: `${realPayments.length} versements chargés avec succès.`
        });
      } else {
        // No real investments found
        console.log("No real investments found");
        setPaymentRecords([]);
        toast.info("Aucun investissement", {
          description: "Aucun investissement trouvé pour votre compte."
        });
      }
    } catch (error) {
      console.error("Error loading real-time investment data:", error);
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
    animateRefresh,
    userId,
    handleSort,
    handleRefresh
  };
};

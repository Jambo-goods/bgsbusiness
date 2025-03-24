
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScheduledPayment } from "../types/investment";

export function useScheduledPayments(projectId: string) {
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [firstPaymentDelay, setFirstPaymentDelay] = useState<number>(1);

  const fetchScheduledPayments = useCallback(async () => {
    if (!projectId) {
      setError("ID du projet manquant");
      setLoading(false);
      setIsRefreshing(false);
      return;
    }
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Get project details for first payment delay
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("first_payment_delay_months")
        .eq("id", projectId)
        .single();
        
      if (projectError) {
        throw new Error(projectError.message);
      }
      
      const firstPaymentDelayMonths = projectData?.first_payment_delay_months || 1;
      setFirstPaymentDelay(firstPaymentDelayMonths);
      
      // Get scheduled payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("scheduled_payments")
        .select(`
          *,
          projects:project_id (
            name,
            image,
            company_name,
            status,
            first_payment_delay_months
          )
        `)
        .eq("project_id", projectId)
        .order("payment_date", { ascending: true });

      if (paymentsError) {
        throw new Error(paymentsError.message);
      }
      
      // Convert to typed payments
      const typedPayments = paymentsData?.map(payment => ({
        ...payment,
        status: (payment.status === 'paid' ? 'paid' : 
                payment.status === 'pending' ? 'pending' : 'scheduled') as 'scheduled' | 'pending' | 'paid'
      })) || [];
      
      setScheduledPayments(typedPayments);
    } catch (err: any) {
      console.error("Error fetching scheduled payments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetchScheduledPayments();
    } else {
      setError("ID du projet manquant");
      setLoading(false);
    }
    
    // Set up real-time listener
    const channel = projectId ? supabase
      .channel('scheduled_payments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'scheduled_payments',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          fetchScheduledPayments();
        }
      )
      .subscribe() : null;

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [projectId, fetchScheduledPayments]);

  return {
    scheduledPayments,
    loading,
    error,
    isRefreshing,
    firstPaymentDelay,
    refreshData: fetchScheduledPayments
  };
}

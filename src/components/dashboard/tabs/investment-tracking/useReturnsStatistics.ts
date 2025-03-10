
import { PaymentRecord, ScheduledPayment } from "./types";
import { calculateCumulativeReturns, filterAndSortPayments } from "./utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const useReturnsStatistics = (
  paymentRecords: PaymentRecord[],
  filterStatus: string,
  sortColumn: string,
  sortDirection: "asc" | "desc"
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([]);

  // Fetch scheduled payments from Supabase
  useEffect(() => {
    const fetchScheduledPayments = async () => {
      try {
        const { data: payments, error } = await supabase
          .from('scheduled_payments')
          .select(`
            *,
            projects(name)
          `)
          .order('payment_date', { ascending: true });

        if (error) throw error;
        setScheduledPayments(payments || []);
      } catch (error) {
        console.error('Error fetching scheduled payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduledPayments();

    // Set up real-time subscription
    const channel = supabase
      .channel('scheduled_payments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'scheduled_payments' },
        () => {
          fetchScheduledPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate cumulative returns
  const cumulativeReturns = calculateCumulativeReturns(paymentRecords);
  
  // Filter and sort payment records
  const filteredAndSortedPayments = filterAndSortPayments(
    paymentRecords,
    filterStatus,
    sortColumn,
    sortDirection
  );
  
  // Calculate totals
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
  
  return {
    cumulativeReturns,
    filteredAndSortedPayments,
    scheduledPayments,
    totalPaid,
    totalPending,
    averageMonthlyReturn,
    isLoading
  };
};

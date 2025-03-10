
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
        
        // Cast the payments to match the ScheduledPayment type
        const typedPayments: ScheduledPayment[] = payments?.map(payment => {
          // Calculate the scheduled amount based on percentage
          // Make sure to handle non-numeric values properly
          const percentage = typeof payment.percentage === 'number' ? payment.percentage : 0;
          const investedAmount = typeof payment.total_invested_amount === 'number' ? payment.total_invested_amount : 0;
          const calculatedAmount = investedAmount * (percentage / 100);
          
          return {
            ...payment,
            // Override the total_scheduled_amount with the calculated value
            total_scheduled_amount: calculatedAmount,
            status: payment.status as 'scheduled' | 'pending' | 'paid'
          };
        }) || [];
        
        setScheduledPayments(typedPayments);
        console.log("Fetched scheduled payments with calculated amounts:", typedPayments);
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

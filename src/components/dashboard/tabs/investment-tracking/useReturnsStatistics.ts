
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { Investment, PaymentRecord, PaymentStatistics, ScheduledPayment } from "./types";
import { calculateCumulativeReturns, filterAndSortPayments } from "./utils";

export const useReturnsStatistics = () => {
  const { data: scheduledPayments, isLoading } = useQuery({
    queryKey: ["scheduled-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_payments")
        .select(`
          *,
          projects:project_id (
            name,
            image,
            company_name,
            status
          )
        `)
        .order("payment_date", { ascending: true });

      if (error) {
        console.error("Error fetching scheduled payments:", error);
        throw error;
      }

      return data || [];
    },
  });

  const statistics = useMemo(() => {
    if (!scheduledPayments) return null;

    const totalScheduledAmount = scheduledPayments.reduce(
      (sum, payment) => sum + (payment.total_scheduled_amount || 0),
      0
    );

    // Calculate payments received
    const paymentsReceived = scheduledPayments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + (payment.total_scheduled_amount || 0), 0);

    // Sort payments by date for cumulative calculation
    const sortedPayments = [...scheduledPayments].sort(
      (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );

    // Calculate cumulative amounts for each payment
    let cumulativeAmount = 0;
    const paymentsWithCumulative = sortedPayments.map(payment => {
      if (payment.status === "paid") {
        cumulativeAmount += (payment.total_scheduled_amount || 0);
      }
      return {
        ...payment,
        calculatedCumulativeAmount: payment.status === "paid" ? cumulativeAmount : 0
      };
    });

    // Convert scheduled payments to PaymentRecord format for consistent processing
    const paymentRecords: PaymentRecord[] = scheduledPayments.map(payment => ({
      id: payment.id,
      projectId: payment.project_id,
      projectName: payment.projects?.name || "Projet inconnu",
      amount: payment.total_scheduled_amount || 0,
      date: new Date(payment.payment_date),
      type: 'yield' as const,
      status: payment.status as "paid" | "pending" | "scheduled",
      percentage: payment.percentage
    }));

    // Calculate additional statistics
    const totalPaid = paymentRecords
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalPending = paymentRecords
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const paidPayments = paymentRecords.filter(payment => payment.status === 'paid');
    const averageMonthlyReturn = paidPayments.length > 0 
      ? totalPaid / paidPayments.length 
      : 0;

    // Apply default filters and sorting
    const filteredAndSortedPayments = filterAndSortPayments(
      paymentRecords,
      'all',
      'date',
      'desc'
    );

    // Calculate cumulative returns
    const cumulativeReturns = calculateCumulativeReturns(paymentRecords);

    return {
      totalScheduledAmount,
      paymentsReceived,
      paymentsWithCumulative,
      percentageReceived: totalScheduledAmount > 0 
        ? (paymentsReceived / totalScheduledAmount) * 100 
        : 0,
      totalPaid,
      totalPending,
      averageMonthlyReturn,
      filteredAndSortedPayments,
      cumulativeReturns
    } as PaymentStatistics;
  }, [scheduledPayments]);

  return {
    statistics,
    isLoading,
    scheduledPayments,
  };
};

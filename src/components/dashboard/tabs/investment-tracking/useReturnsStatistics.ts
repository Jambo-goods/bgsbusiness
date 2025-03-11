
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { Investment, ScheduledPayment } from "./types";

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

    return {
      totalScheduledAmount,
      paymentsReceived,
      paymentsWithCumulative,
      percentageReceived: totalScheduledAmount > 0 
        ? (paymentsReceived / totalScheduledAmount) * 100 
        : 0,
    };
  }, [scheduledPayments]);

  return {
    statistics,
    isLoading,
    scheduledPayments,
  };
};

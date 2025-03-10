
import { PaymentRecord } from "./types";
import { calculateCumulativeReturns, filterAndSortPayments } from "./utils";

export const useReturnsStatistics = (
  paymentRecords: PaymentRecord[],
  filterStatus: string,
  sortColumn: string,
  sortDirection: "asc" | "desc"
) => {
  // Calculate cumulative returns
  const cumulativeReturns = calculateCumulativeReturns(paymentRecords);
  
  // Filter and sort payment records
  const filteredAndSortedPayments = filterAndSortPayments(
    paymentRecords,
    filterStatus,
    sortColumn,
    sortDirection
  );
  
  // Calculate total returns
  const totalPaid = paymentRecords
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPending = paymentRecords
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
    
  const totalScheduled = paymentRecords
    .filter(payment => payment.status === 'scheduled')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate average monthly return
  const paidPayments = paymentRecords.filter(payment => payment.status === 'paid');
  const averageMonthlyReturn = paidPayments.length > 0
    ? Math.round(totalPaid / paidPayments.length)
    : 0;
  
  // Count future payments
  const futurePaymentsCount = paymentRecords.filter(
    payment => payment.status === 'pending' || payment.status === 'scheduled'
  ).length;
  
  return {
    cumulativeReturns,
    filteredAndSortedPayments,
    totalPaid,
    totalPending,
    totalScheduled,
    averageMonthlyReturn,
    futurePaymentsCount
  };
};

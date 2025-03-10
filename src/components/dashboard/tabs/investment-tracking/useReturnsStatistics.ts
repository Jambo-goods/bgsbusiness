
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
  
  // Calculate average monthly return
  const averageMonthlyReturn = Math.round(
    totalPaid / Math.max(cumulativeReturns.length, 1)
  );
  
  return {
    cumulativeReturns,
    filteredAndSortedPayments,
    totalPaid,
    totalPending,
    averageMonthlyReturn
  };
};

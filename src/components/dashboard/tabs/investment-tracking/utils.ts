
import { PaymentRecord } from "./types";
import { format, addMonths, differenceInMonths } from "date-fns";

export const calculateCumulativeReturns = (payments: PaymentRecord[]) => {
  // Sort payments by date
  const sortedPayments = [...payments].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculate cumulative returns over time (for charts)
  let cumulative = 0;
  return sortedPayments.map(payment => {
    if (payment.status === 'paid') {
      cumulative += payment.amount;
    }
    return {
      date: format(payment.date, 'MMM yyyy'),
      amount: payment.amount,
      cumulative
    };
  });
};

export const filterAndSortPayments = (
  payments: PaymentRecord[],
  filterStatus: string,
  sortColumn: string,
  sortDirection: "asc" | "desc"
) => {
  return [...payments]
    .filter(payment => {
      if (filterStatus === 'all') return true;
      return payment.status === filterStatus;
    })
    .sort((a, b) => {
      // Sort by the specified column
      let comparison = 0;
      
      switch (sortColumn) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'project':
          comparison = a.projectName.localeCompare(b.projectName);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = a.date.getTime() - b.date.getTime();
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
};

// Generate investment payment records from real data
export const generatePaymentsFromRealData = (investments: any[]) => {
  const payments: PaymentRecord[] = [];
  
  investments.forEach(investment => {
    // Calculate number of months since investment started
    const startDate = new Date(investment.date);
    const currentDate = new Date();
    const monthsSinceStart = differenceInMonths(currentDate, startDate);
    
    // Generate monthly yield payments for each past month
    for (let i = 1; i <= monthsSinceStart; i++) {
      const paymentDate = addMonths(startDate, i);
      const isPaid = paymentDate <= currentDate;
      
      // Monthly yield payment (based on investment amount and yield rate)
      const monthlyYield = Math.round(investment.amount * (investment.yield_rate / 100));
      
      payments.push({
        id: `${investment.id}-yield-${i}`,
        projectId: investment.project_id,
        projectName: investment.project?.name || 'Projet inconnu',
        amount: monthlyYield,
        date: paymentDate,
        type: 'yield',
        status: isPaid ? 'paid' : 'scheduled'
      });
    }
    
    // If investment has an end date, add capital return payment
    if (investment.end_date) {
      const endDate = new Date(investment.end_date);
      
      payments.push({
        id: `${investment.id}-capital`,
        projectId: investment.project_id,
        projectName: investment.project?.name || 'Projet inconnu',
        amount: investment.amount,
        date: endDate,
        type: 'capital',
        status: endDate <= currentDate ? 'paid' : 'scheduled'
      });
    }
  });
  
  // Sort payments by date
  return payments.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Fetch real-time investment data including projects
export const fetchRealTimeInvestmentData = async (userId: string) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        project:project_id(
          id, 
          name,
          description,
          duration,
          yield
        )
      `)
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching investments data:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchRealTimeInvestmentData:", error);
    return [];
  }
};

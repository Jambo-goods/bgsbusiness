import { PaymentRecord } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const fetchRealTimeInvestmentData = async (userId: string | undefined) => {
  if (!userId) {
    console.log("No user ID provided, cannot fetch real-time investment data");
    return [];
  }
  
  try {
    console.log("Fetching real-time investment data for user:", userId);
    const { data: investments, error } = await supabase
      .from('investments')
      .select(`
        *,
        projects(*)
      `)
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error fetching real-time investment data:", error);
      throw error;
    }
    
    console.log(`Fetched ${investments?.length || 0} investments for real-time tracking`);
    
    if (!investments || investments.length === 0) {
      console.log("No investments found for user:", userId);
    }
    
    return investments || [];
  } catch (error) {
    console.error("Error in fetchRealTimeInvestmentData:", error);
    return [];
  }
};

export const calculateCumulativeReturns = (paymentRecords: PaymentRecord[]) => {
  const sortedPayments = [...paymentRecords]
    .filter(payment => payment.status === 'paid')
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  let cumulative = 0;
  return sortedPayments.map(payment => {
    cumulative += payment.amount;
    return {
      ...payment,
      cumulativeReturn: cumulative
    };
  });
};

export const filterAndSortPayments = (
  paymentRecords: PaymentRecord[],
  filterStatus: string,
  sortColumn: string,
  sortDirection: "asc" | "desc"
) => {
  return [...paymentRecords]
    .filter(payment => filterStatus === 'all' || payment.status === filterStatus)
    .sort((a, b) => {
      if (sortColumn === 'date') {
        return sortDirection === 'asc' 
          ? a.date.getTime() - b.date.getTime() 
          : b.date.getTime() - a.date.getTime();
      } else if (sortColumn === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else if (sortColumn === 'projectName') {
        return sortDirection === 'asc'
          ? a.projectName.localeCompare(b.projectName)
          : b.projectName.localeCompare(a.projectName);
      }
      return 0;
    });
};

export const generatePaymentsFromRealData = (investments: Investment[]): PaymentRecord[] => {
  const records: PaymentRecord[] = [];
  
  investments.forEach(investment => {
    // Get project information and payment schedule
    const projectName = investment.project?.name || 'Projet inconnu';
    const projectId = investment.project_id;
    const amount = investment.amount || 0;
    const monthlyYield = (investment.project?.yield || investment.yield_rate || 0) / 100;
    const startDate = new Date(investment.date || Date.now());
    
    // Get the first payment delay from the project (default to 1 if not specified)
    const firstPaymentDelay = investment.project?.first_payment_delay_months || 1;
    console.log(`First payment delay for ${projectName}:`, firstPaymentDelay, "months");
    
    // Calculate monthly return
    const monthlyReturn = amount * monthlyYield;
    
    // Generate 12 months of payment records
    for (let i = 0; i < 12; i++) {
      const paymentDate = new Date(startDate);
      
      // Apply payment delay for the first payment
      if (i === 0 && firstPaymentDelay > 1) {
        paymentDate.setMonth(paymentDate.getMonth() + firstPaymentDelay);
      } else {
        paymentDate.setMonth(paymentDate.getMonth() + i + 1); // +1 because payments start 1 month after investment
      }
      
      // Skip if payment date is in the future
      const now = new Date();
      
      // Determine status based on date
      let status: 'paid' | 'pending' | 'scheduled' = 'scheduled';
      
      if (paymentDate <= now) {
        status = 'paid';
      } else if (paymentDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        status = 'pending'; // Due within a week
      }
      
      records.push({
        id: `${projectId}-${i}`,
        projectId,
        projectName,
        amount: monthlyReturn,
        date: paymentDate,
        type: 'yield',
        status,
        firstPaymentDelay
      });
    }
  });
  
  return records;
};

export const adjustDateForFirstPaymentDelay = (
  baseDate: Date, 
  delayMonths: number = 1
): Date => {
  const adjustedDate = new Date(baseDate);
  adjustedDate.setMonth(adjustedDate.getMonth() + (delayMonths - 1));
  return adjustedDate;
};

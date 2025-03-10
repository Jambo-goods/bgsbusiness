
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

export const generatePaymentsFromRealData = (investments: any[]): PaymentRecord[] => {
  if (!investments || investments.length === 0) {
    console.log("No investments provided to generate payment records");
    return [];
  }
  
  console.log(`Generating payment records from ${investments.length} real investments`);
  
  let payments: PaymentRecord[] = [];
  const now = new Date();
  
  investments.forEach((investment, index) => {
    if (!investment.projects) {
      console.log(`Investment at index ${index} missing projects data:`, investment);
      return;
    }
    
    // Calculate payments based on actual investment data
    const startDate = investment.date ? new Date(investment.date) : new Date();
    const amount = investment.amount || 0;
    const yield_rate = investment.yield_rate || investment.projects.yield || 0;
    const monthlyReturn = Math.round((yield_rate / 100) * amount);
    
    console.log(`Investment ${index}: amount=${amount}, yield=${yield_rate}%, monthly=${monthlyReturn}`);
    
    // Generate past payments based on actual investment date
    const monthsSinceInvestment = Math.max(
      0,
      (now.getFullYear() - startDate.getFullYear()) * 12 + 
      now.getMonth() - startDate.getMonth()
    );
    
    console.log(`Investment ${index}: months since start=${monthsSinceInvestment}`);
    
    // Past and current payments (paid)
    for (let i = 0; i <= monthsSinceInvestment; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i);
      
      // Only add if payment date is not in the future
      if (paymentDate <= now) {
        payments.push({
          id: `payment-${investment.id}-${i}`,
          projectId: investment.project_id,
          projectName: investment.projects.name,
          amount: monthlyReturn,
          date: paymentDate,
          type: 'yield',
          status: 'paid'
        });
      }
    }
    
    // Pending payment (next month)
    const pendingDate = new Date(now);
    pendingDate.setMonth(now.getMonth() + 1);
    
    payments.push({
      id: `payment-${investment.id}-pending`,
      projectId: investment.project_id,
      projectName: investment.projects.name,
      amount: monthlyReturn,
      date: pendingDate,
      type: 'yield',
      status: 'pending'
    });
    
    // Future scheduled payments
    for (let i = 2; i <= 3; i++) {
      const futureDate = new Date(now);
      futureDate.setMonth(now.getMonth() + i);
      
      payments.push({
        id: `payment-${investment.id}-future-${i}`,
        projectId: investment.project_id,
        projectName: investment.projects.name,
        amount: monthlyReturn,
        date: futureDate,
        type: 'yield',
        status: 'scheduled'
      });
    }
  });
  
  console.log(`Generated ${payments.length} payment records from real investment data`);
  return payments;
};

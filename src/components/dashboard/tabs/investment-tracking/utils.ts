import { PaymentRecord, ScheduledPayment } from "./types";
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

export const fetchScheduledPayments = async (): Promise<ScheduledPayment[]> => {
  try {
    // Get all scheduled payments with project details
    const { data, error } = await supabase
      .from('scheduled_payments')
      .select(`
        *,
        project:projects(name, image)
      `)
      .order('payment_date', { ascending: false });
    
    if (error) {
      console.error("Error fetching scheduled payments:", error);
      return [];
    }
    
    if (!data) return [];
    
    // Map the data to match our ScheduledPayment type
    return data.map(payment => ({
      ...payment,
      id: `payment-${payment.project_id}-${payment.payment_date}`,
      project: payment.project || { name: null, image: null }
    })) as ScheduledPayment[];
  } catch (error) {
    console.error("Error fetching scheduled payments:", error);
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

export const generatePaymentsFromRealData = (investments: any[], scheduledPayments: ScheduledPayment[] = []): PaymentRecord[] => {
  if (!investments || investments.length === 0) {
    console.log("No investments provided to generate payment records");
    
    // If we have scheduled payments but no investments, just use the scheduled payments
    if (scheduledPayments.length > 0) {
      console.log(`Converting ${scheduledPayments.length} scheduled payments to payment records`);
      return scheduledPaymentsToPaymentRecords(scheduledPayments);
    }
    
    return [];
  }
  
  console.log(`Generating payment records from ${investments.length} real investments and ${scheduledPayments.length} scheduled payments`);
  
  let payments: PaymentRecord[] = [];
  const now = new Date();
  
  // Create payments from investments data
  investments.forEach((investment, index) => {
    if (!investment.projects) {
      console.log(`Investment at index ${index} missing projects data:`, investment);
      return;
    }
    
    // Calculate payments based on actual investment data
    const startDate = investment.date ? new Date(investment.date) : new Date();
    const amount = investment.amount || 0;
    const yield_rate = investment.yield_rate || investment.projects.yield || 0;
    const monthlyReturn = Math.round((yield_rate / 100) * amount / 12);
    
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
  });
  
  // Convert scheduled payments to PaymentRecord format
  const scheduledRecords = scheduledPaymentsToPaymentRecords(scheduledPayments);
  payments = [...payments, ...scheduledRecords];
  
  console.log(`Generated ${payments.length} payment records from real investment data and scheduled payments`);
  return payments;
};

// Helper function to convert ScheduledPayment objects to PaymentRecord objects
const scheduledPaymentsToPaymentRecords = (scheduledPayments: ScheduledPayment[]): PaymentRecord[] => {
  return scheduledPayments.map(payment => ({
    id: payment.id || `payment-${payment.project_id}-${payment.payment_date}`,
    projectId: payment.project_id || '',
    projectName: payment.project?.name || "Projet inconnu",
    amount: Number(payment.total_scheduled_amount || 0),
    date: new Date(payment.payment_date),
    type: 'yield',
    status: payment.status as 'paid' | 'pending' | 'scheduled',
    cumulativeAmount: payment.cumulative_amount ? Number(payment.cumulative_amount) : undefined
  }));
};

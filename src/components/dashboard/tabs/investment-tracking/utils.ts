import { PaymentRecord } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";

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

export const generatePaymentsFromRealData = async (investments: any[]): Promise<PaymentRecord[]> => {
  if (!investments || investments.length === 0) {
    console.log("No investments provided to generate payment records");
    return [];
  }
  
  console.log(`Generating payment records from ${investments.length} real investments`);
  
  let payments: PaymentRecord[] = [];
  const now = new Date();

  // Fetch all related projects to get their first payment delay
  const projectIds = investments.map(inv => inv.project_id);
  const { data: projectsData, error } = await supabase
    .from('projects')
    .select('id, first_payment_delay_months')
    .in('id', projectIds);

  if (error) {
    console.error("Error fetching projects data:", error);
    return [];
  }

  const projectDelays = new Map(projectsData?.map(p => [p.id, p.first_payment_delay_months || 1]) || []);
  
  for (const investment of investments) {
    if (!investment.projects) {
      console.log(`Investment missing projects data:`, investment);
      continue;
    }
    
    const investmentDate = new Date(investment.date);
    const amount = investment.amount || 0;
    const yield_rate = investment.yield_rate || investment.projects.yield || 0;
    const monthlyReturn = Math.round((yield_rate / 100) * amount);
    const firstPaymentDelay = projectDelays.get(investment.project_id) || 1;
    
    console.log(`Investment for ${investment.projects.name}:`, {
      amount,
      yield: yield_rate,
      monthly: monthlyReturn,
      firstPaymentDelay
    });

    // Calculate first payment date (investment date + delay months)
    const firstPaymentDate = new Date(investmentDate);
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + firstPaymentDelay);
    
    // Calculate how many months have passed since the first payment date
    const monthsSinceFirstPayment = Math.max(
      0,
      (now.getFullYear() - firstPaymentDate.getFullYear()) * 12 + 
      now.getMonth() - firstPaymentDate.getMonth()
    );
    
    console.log(`Months since first payment for ${investment.projects.name}:`, monthsSinceFirstPayment);
    
    // Generate past payments starting from the first payment date
    for (let i = 0; i <= monthsSinceFirstPayment; i++) {
      const paymentDate = new Date(firstPaymentDate);
      paymentDate.setMonth(firstPaymentDate.getMonth() + i);
      
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
    
    // Add pending payment (next month after the last paid payment)
    const lastPaymentDate = new Date(firstPaymentDate);
    lastPaymentDate.setMonth(firstPaymentDate.getMonth() + monthsSinceFirstPayment + 1);
    
    payments.push({
      id: `payment-${investment.id}-pending`,
      projectId: investment.project_id,
      projectName: investment.projects.name,
      amount: monthlyReturn,
      date: lastPaymentDate,
      type: 'yield',
      status: 'pending'
    });
    
    // Add scheduled future payments
    for (let i = 2; i <= 3; i++) {
      const futurePaymentDate = new Date(firstPaymentDate);
      futurePaymentDate.setMonth(firstPaymentDate.getMonth() + monthsSinceFirstPayment + i);
      
      payments.push({
        id: `payment-${investment.id}-future-${i}`,
        projectId: investment.project_id,
        projectName: investment.projects.name,
        amount: monthlyReturn,
        date: futurePaymentDate,
        type: 'yield',
        status: 'scheduled'
      });
    }
  }
  
  // Sort payments by date
  payments.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log(`Generated ${payments.length} payment records considering first payment delays`);
  return payments;
};

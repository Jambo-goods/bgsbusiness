
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
        projects(*, first_payment_delay_months)
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

export const calculateExpectedCumulativeReturns = (paymentRecords: PaymentRecord[]) => {
  const sortedPayments = [...paymentRecords]
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  let cumulative = 0;
  return sortedPayments.map(payment => {
    cumulative += payment.amount;
    return {
      ...payment,
      expectedCumulativeReturn: cumulative
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

// Helper function for calculating monthly yield consistently across the app
// Le pourcentage fourni est déjà un pourcentage mensuel (ex: 12%)
export const calculateMonthlyYield = (investmentAmount: number, monthlyYieldPercentage: number): number => {
  // Calcul direct: montant d'investissement * (pourcentage mensuel / 100)
  return (investmentAmount * monthlyYieldPercentage) / 100;
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
    
    const investmentDate = investment.date ? new Date(investment.date) : new Date();
    const amount = investment.amount || 0;
    
    // Pourcentage fixe de 12% mensuel pour tous les investissements
    const fixedYieldRate = 12;
    
    // Use the helper function for consistent calculation - this is monthly yield
    const monthlyReturn = calculateMonthlyYield(amount, fixedYieldRate);
    
    console.log(`Investment ${index}: amount=${amount}, monthly yield=${fixedYieldRate}%, monthly return=${monthlyReturn}`);
    
    const firstPaymentDelayMonths = investment.projects.first_payment_delay_months || 1;
    console.log(`Investment ${index}: First payment delay: ${firstPaymentDelayMonths} months`);
    
    // Create first payment date based on investment date plus delay, keeping the original day
    const firstPaymentDate = new Date(investmentDate);
    firstPaymentDate.setMonth(investmentDate.getMonth() + firstPaymentDelayMonths);
    
    console.log(`Investment ${index}: Investment date=${investmentDate.toISOString()}, First payment date=${firstPaymentDate.toISOString()}`);
    
    const isFirstPaymentDue = firstPaymentDate <= now;
    console.log(`Investment ${index}: Is first payment due? ${isFirstPaymentDue ? 'Yes' : 'No'}`);
    
    const monthsSinceFirstPayment = Math.max(
      0,
      (now.getFullYear() - firstPaymentDate.getFullYear()) * 12 + 
      now.getMonth() - firstPaymentDate.getMonth()
    );
    
    console.log(`Investment ${index}: Months since first payment date: ${monthsSinceFirstPayment}`);
    
    if (isFirstPaymentDue) {
      for (let i = 0; i <= monthsSinceFirstPayment; i++) {
        const paymentDate = new Date(firstPaymentDate);
        paymentDate.setMonth(firstPaymentDate.getMonth() + i);
        
        if (paymentDate < now) {
          payments.push({
            id: `payment-${investment.id}-${i}`,
            projectId: investment.project_id,
            projectName: investment.projects.name,
            amount: monthlyReturn,
            date: paymentDate,
            type: 'yield',
            status: 'paid',
            isProjectedPayment: false,
            percentage: fixedYieldRate
          });
        }
      }
      
      let nextPaymentDate = new Date(firstPaymentDate);
      nextPaymentDate.setMonth(firstPaymentDate.getMonth() + monthsSinceFirstPayment);
      
      if (nextPaymentDate <= now) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      console.log(`Investment ${index}: Next payment after paid ones at ${nextPaymentDate.toISOString()}`);
      
      payments.push({
        id: `payment-${investment.id}-pending`,
        projectId: investment.project_id,
        projectName: investment.projects.name,
        amount: monthlyReturn,
        date: nextPaymentDate,
        type: 'yield',
        status: 'pending',
        isProjectedPayment: false,
        percentage: fixedYieldRate
      });
      
      for (let i = 1; i <= 2; i++) {
        const futureDate = new Date(nextPaymentDate);
        futureDate.setMonth(nextPaymentDate.getMonth() + i);
        
        payments.push({
          id: `payment-${investment.id}-future-${i}`,
          projectId: investment.project_id,
          projectName: investment.projects.name,
          amount: monthlyReturn,
          date: futureDate,
          type: 'yield',
          status: 'scheduled',
          isProjectedPayment: false,
          percentage: fixedYieldRate
        });
      }
    } else {
      payments.push({
        id: `payment-${investment.id}-projected`,
        projectId: investment.project_id,
        projectName: investment.projects.name,
        amount: monthlyReturn,
        date: firstPaymentDate,
        type: 'yield',
        status: 'scheduled',
        isProjectedPayment: true,
        percentage: fixedYieldRate
      });
    }
  });
  
  console.log(`Generated ${payments.length} payment records from real investment data`);
  return payments;
};

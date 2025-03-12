
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
    const investmentDate = investment.date ? new Date(investment.date) : new Date();
    const amount = investment.amount || 0;
    const yield_rate = investment.yield_rate || investment.projects.yield || 0;
    const monthlyReturn = Math.round((yield_rate / 100) * amount / 12);
    
    // Get the first payment delay months value from the project
    const firstPaymentDelayMonths = investment.projects.first_payment_delay_months || 1;
    console.log(`Investment ${index}: First payment delay: ${firstPaymentDelayMonths} months`);
    
    // Calculate first payment date by adding the delay to the investment date
    const firstPaymentDate = new Date(investmentDate);
    firstPaymentDate.setMonth(investmentDate.getMonth() + firstPaymentDelayMonths);
    
    console.log(`Investment ${index}: Investment date=${investmentDate.toISOString()}, First payment date=${firstPaymentDate.toISOString()}`);
    console.log(`Investment ${index}: amount=${amount}, yield=${yield_rate}%, monthly=${monthlyReturn}`);
    
    // CORRECTION: N'ajoutez PAS de paiements "paid" avant la date du premier paiement
    // Calculate how many months have passed since the first payment date
    const monthsSinceFirstPayment = Math.max(
      0,
      (now.getFullYear() - firstPaymentDate.getFullYear()) * 12 + 
      now.getMonth() - firstPaymentDate.getMonth()
    );
    
    console.log(`Investment ${index}: Months since first payment date: ${monthsSinceFirstPayment}`);
    
    // Only add past payments if the first payment date is in the past
    if (firstPaymentDate <= now) {
      // Past and current payments (paid)
      for (let i = 0; i <= monthsSinceFirstPayment; i++) {
        const paymentDate = new Date(firstPaymentDate);
        paymentDate.setMonth(firstPaymentDate.getMonth() + i);
        
        // CORRECTION: Vérifiez que le paiement est STRICTEMENT dans le passé
        if (paymentDate < now) {
          payments.push({
            id: `payment-${investment.id}-${i}`,
            projectId: investment.project_id,
            projectName: investment.projects.name,
            amount: monthlyReturn,
            date: paymentDate,
            type: 'yield',
            status: 'paid',
            isProjectedPayment: false
          });
        }
      }
    }
    
    // Calculate the correct next payment date based on the first payment date
    let nextPaymentDate;
    
    if (firstPaymentDate > now) {
      // If the first payment date is in the future, that's our next payment
      // This respects the first_payment_delay_months
      nextPaymentDate = new Date(firstPaymentDate);
      console.log(`Investment ${index}: First payment is in the future at ${nextPaymentDate.toISOString()}, respecting ${firstPaymentDelayMonths} months delay`);
    } else {
      // Calculate the next payment date after the last paid one
      nextPaymentDate = new Date(firstPaymentDate);
      nextPaymentDate.setMonth(firstPaymentDate.getMonth() + monthsSinceFirstPayment);
      
      // CORRECTION: Assurez-vous que la date du prochain paiement est dans le futur
      if (nextPaymentDate <= now) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      console.log(`Investment ${index}: Next payment after paid ones at ${nextPaymentDate.toISOString()}`);
    }
    
    // Ajout du prochain paiement en attente (pending)
    payments.push({
      id: `payment-${investment.id}-pending`,
      projectId: investment.project_id,
      projectName: investment.projects.name,
      amount: monthlyReturn,
      date: nextPaymentDate,
      type: 'yield',
      status: 'pending',
      isProjectedPayment: firstPaymentDate > now
    });
    
    // Paiements futurs programmés (2 mois après le paiement en attente)
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
        isProjectedPayment: firstPaymentDate > now
      });
    }
  });
  
  console.log(`Generated ${payments.length} payment records from real investment data`);
  return payments;
};

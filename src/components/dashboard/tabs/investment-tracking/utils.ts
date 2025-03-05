
import { Project } from "@/types/project";
import { PaymentRecord } from "./types";

export const generatePayments = (userInvestments: Project[]): PaymentRecord[] => {
  let payments: PaymentRecord[] = [];
  const now = new Date();
  
  userInvestments.forEach(project => {
    // Generate past payments (3 months of history)
    for (let i = 1; i <= 3; i++) {
      const pastDate = new Date();
      pastDate.setMonth(now.getMonth() - i);
      
      payments.push({
        id: `payment-${project.id}-past-${i}`,
        projectId: project.id,
        projectName: project.name,
        amount: Math.round((project.yield / 100) * 2500), // Assuming 2500€ investment per project
        date: pastDate,
        type: 'yield',
        status: 'paid'
      });
    }
    
    // Current month payment
    payments.push({
      id: `payment-${project.id}-current`,
      projectId: project.id,
      projectName: project.name,
      amount: Math.round((project.yield / 100) * 2500),
      date: now,
      type: 'yield',
      status: 'paid'
    });
    
    // Future payments (2 months ahead)
    for (let i = 1; i <= 2; i++) {
      const futureDate = new Date();
      futureDate.setMonth(now.getMonth() + i);
      
      payments.push({
        id: `payment-${project.id}-future-${i}`,
        projectId: project.id,
        projectName: project.name,
        amount: Math.round((project.yield / 100) * 2500),
        date: futureDate,
        type: 'yield',
        status: i === 1 ? 'pending' : 'scheduled'
      });
    }
  });
  
  return payments;
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

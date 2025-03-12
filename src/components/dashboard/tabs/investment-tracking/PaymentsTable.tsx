
import React from "react";
import { format } from "date-fns";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Calendar, SortAsc, SortDesc, Check, Clock, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { Project } from "@/types/project";
import { PaymentRecord, ScheduledPayment } from "./types";

interface PaymentsTableProps {
  filteredAndSortedPayments: PaymentRecord[];
  scheduledPayments: ScheduledPayment[];
  cumulativeReturns: (PaymentRecord & { cumulativeReturn: number })[];
  sortColumn: string;
  sortDirection: "asc" | "desc";
  handleSort: (column: string) => void;
  userInvestments: Project[];
}

export default function PaymentsTable({ 
  filteredAndSortedPayments,
  scheduledPayments,
  cumulativeReturns,
  sortColumn,
  sortDirection,
  handleSort,
  userInvestments
}: PaymentsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5 mr-1.5 text-orange-500" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-blue-500" />;
    }
  };

  console.log("Scheduled payments in PaymentsTable:", scheduledPayments);
  console.log("User investments:", userInvestments);
  console.log("Cumulative returns data:", cumulativeReturns);

  const totalInvestedAmount = userInvestments.reduce((sum, project) => {
    const amount = project.investedAmount || 0;
    console.log(`Investment amount for ${project.name}:`, amount);
    return sum + amount;
  }, 0);

  console.log("Total invested amount:", totalInvestedAmount);

  // Map to store unique payment entries by date and project
  const uniquePaymentMap = new Map();
  
  // First process all payments from filteredAndSortedPayments
  filteredAndSortedPayments.forEach(payment => {
    const key = `${payment.projectId}-${payment.date.toISOString()}`;
    uniquePaymentMap.set(key, payment);
  });
  
  // Then process scheduled payments, only adding if they don't overlap with existing payments
  // and if they are past the first payment delay for their project
  scheduledPayments.forEach(sp => {
    const paymentDate = new Date(sp.payment_date);
    const key = `${sp.project_id}-${paymentDate.toISOString()}`;
    
    // Find the corresponding project for this scheduled payment
    const project = userInvestments.find(p => p.id === sp.project_id);
    
    // Only add if this date+project combination doesn't exist yet
    if (!uniquePaymentMap.has(key) && project) {
      // Get the investment date and calculate if this payment should be shown
      const investmentDate = project.investmentDate ? new Date(project.investmentDate) : new Date();
      const firstPaymentDelayMonths = project.firstPaymentDelayMonths || 1;
      
      // Calculate the first valid payment date
      const firstValidPaymentDate = new Date(investmentDate);
      firstValidPaymentDate.setMonth(investmentDate.getMonth() + firstPaymentDelayMonths);
      
      // Only add the payment if it's on or after the first valid payment date
      if (paymentDate >= firstValidPaymentDate) {
        const percentage = sp.percentage || 0;
        const calculatedAmount = (percentage / 100) * totalInvestedAmount;
        
        uniquePaymentMap.set(key, {
          id: `${sp.id}-scheduled`,
          projectId: sp.project_id,
          projectName: sp.projects?.name || "Projet inconnu",
          amount: calculatedAmount,
          date: paymentDate,
          type: 'yield' as const,
          status: sp.status as 'paid' | 'pending' | 'scheduled',
          percentage: sp.percentage,
          isProjectedPayment: false
        });
      }
    }
  });
  
  // Convert map to array and sort by date
  const allPayments = Array.from(uniquePaymentMap.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculate cumulative totals for all paid payments
  let runningCumulative = 0;
  const allPaymentsWithCumulative = allPayments.map(payment => {
    // Only add to cumulative if paid
    if (payment.status === 'paid') {
      runningCumulative += payment.amount;
    }
    
    return {
      ...payment,
      calculatedCumulative: payment.status === 'paid' ? runningCumulative : null
    };
  });
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort('projectName')}>
              <div className="flex items-center">
                Projet
                {sortColumn === 'projectName' && (
                  sortDirection === 'asc' ? 
                    <SortAsc className="ml-1 h-3 w-3" /> : 
                    <SortDesc className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
              <div className="flex items-center">
                Date de versement
                {sortColumn === 'date' && (
                  sortDirection === 'asc' ? 
                    <SortAsc className="ml-1 h-3 w-3" /> : 
                    <SortDesc className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
              <div className="flex items-center">
                Montant
                {sortColumn === 'amount' && (
                  sortDirection === 'asc' ? 
                    <SortAsc className="ml-1 h-3 w-3" /> : 
                    <SortDesc className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead>Pourcentage</TableHead>
            <TableHead>Cumulé</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allPaymentsWithCumulative.map((payment) => {
            // Find the matching cumulative record from the provided data
            const cumulativeRecord = payment.status === 'paid' 
              ? cumulativeReturns.find(record => record.id === payment.id)
              : null;
            
            // Use calculated cumulative or record from props
            const cumulativeValue = payment.calculatedCumulative !== null
              ? Math.round(payment.calculatedCumulative)
              : (cumulativeRecord ? cumulativeRecord.cumulativeReturn : null);
            
            const projectImage = userInvestments.find(p => p.id === payment.projectId)?.image || 
              "https://via.placeholder.com/40";
              
            // Safely check for isProjectedPayment property
            const isProjectedPayment = 'isProjectedPayment' in payment ? payment.isProjectedPayment : false;
              
            return (
              <TableRow key={payment.id} className={`animate-in fade-in duration-300 ${isProjectedPayment ? 'bg-gray-50' : ''}`}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <img
                      src={projectImage}
                      alt={payment.projectName}
                      className="h-6 w-6 rounded-md object-cover mr-2"
                    />
                    {payment.projectName}
                    {isProjectedPayment && (
                      <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-md">
                        Prévisionnel
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {isProjectedPayment ? (
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                    ) : (
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-bgs-gray-medium" />
                    )}
                    {format(new Date(payment.date), "dd/MM/yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${isProjectedPayment ? 'text-purple-600' : 'text-green-600'}`}>
                    {typeof payment.amount === 'number' ? Math.round(payment.amount) : 0} €
                  </span>
                </TableCell>
                <TableCell>
                  {payment.percentage ? (
                    <span className="text-blue-600 font-medium">{payment.percentage}%</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {payment.status === 'paid' && cumulativeValue ? (
                    <span className="font-medium text-bgs-blue">
                      {cumulativeValue} €
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(payment.status)}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isProjectedPayment 
                        ? 'bg-purple-100 text-purple-600'
                        : payment.status === 'paid' 
                        ? 'bg-green-100 text-green-600' 
                        : payment.status === 'pending'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {isProjectedPayment 
                        ? 'Prévisionnel' 
                        : payment.status === 'paid' 
                        ? 'Payé' 
                        : payment.status === 'pending' 
                        ? 'En attente' 
                        : 'Programmé'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {allPaymentsWithCumulative.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-bgs-gray-medium">
                Aucun versement trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

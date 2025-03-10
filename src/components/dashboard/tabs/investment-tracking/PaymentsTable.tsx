
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
import { Calendar, SortAsc, SortDesc, Check, Clock, AlertCircle } from "lucide-react";
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

  // Debug: Log the scheduled payments to check what's coming from the database
  console.log("Scheduled payments in PaymentsTable:", scheduledPayments);

  // Combine scheduled payments with filtered payments
  const allPayments = [
    ...filteredAndSortedPayments,
    ...scheduledPayments.map(sp => {
      // The amount is now calculated from the percentage in useReturnsStatistics
      return {
        id: sp.id,
        projectId: sp.project_id,
        projectName: sp.projects?.name || "Projet inconnu",
        amount: sp.total_scheduled_amount,
        date: new Date(sp.payment_date),
        type: 'yield' as const,
        status: sp.status as 'paid' | 'pending' | 'scheduled',
        percentage: sp.percentage
      };
    })
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
  
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
          {allPayments.map((payment) => {
            // Find cumulative value for this payment if it's paid
            const cumulativeRecord = payment.status === 'paid' 
              ? cumulativeReturns.find(record => record.id === payment.id)
              : null;
            
            // Find project image
            const projectImage = userInvestments.find(p => p.id === payment.projectId)?.image || 
              "https://via.placeholder.com/40";
              
            return (
              <TableRow key={payment.id} className="animate-in fade-in duration-300">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <img
                      src={projectImage}
                      alt={payment.projectName}
                      className="h-6 w-6 rounded-md object-cover mr-2"
                    />
                    {payment.projectName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-bgs-gray-medium" />
                    {format(new Date(payment.date), "dd/MM/yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">{Math.round(payment.amount)} €</span>
                </TableCell>
                <TableCell>
                  {payment.percentage ? (
                    <span className="text-blue-600 font-medium">{payment.percentage}%</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {cumulativeRecord ? (
                    <span className="font-medium text-bgs-blue">
                      {cumulativeRecord.cumulativeReturn} €
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(payment.status)}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'paid' 
                        ? 'bg-green-100 text-green-600' 
                        : payment.status === 'pending'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {payment.status === 'paid' ? 'Payé' : payment.status === 'pending' ? 'En attente' : 'Programmé'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {allPayments.length === 0 && (
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


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
import { ScheduledPayment } from "./types";

interface PaymentsTableProps {
  scheduledPayments: ScheduledPayment[];
  sortColumn: string;
  sortDirection: "asc" | "desc";
  handleSort: (column: string) => void;
  userInvestments: Project[];
}

export default function PaymentsTable({ 
  scheduledPayments,
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

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "—";
    return `${Number(amount).toLocaleString()} €`;
  };
  
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
                Montant total
                {sortColumn === 'amount' && (
                  sortDirection === 'asc' ? 
                    <SortAsc className="ml-1 h-3 w-3" /> : 
                    <SortDesc className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('investors')}>
              <div className="flex items-center">
                Investisseurs
                {sortColumn === 'investors' && (
                  sortDirection === 'asc' ? 
                    <SortAsc className="ml-1 h-3 w-3" /> : 
                    <SortDesc className="ml-1 h-3 w-3" />
                )}
              </div>
            </TableHead>
            <TableHead>Cumulé</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scheduledPayments.length > 0 ? (
            scheduledPayments.map((payment) => {
              // Find project image - first try from userInvestments, then use a default
              const projectImage = payment.project?.image || 
                userInvestments.find(p => p.id === payment.project_id)?.image || 
                "https://via.placeholder.com/40";
                
              return (
                <TableRow key={payment.id} className="animate-in fade-in duration-300">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <img
                        src={projectImage}
                        alt={payment.project?.name || "Projet"}
                        className="h-6 w-6 rounded-md object-cover mr-2"
                      />
                      {payment.project?.name || "Projet inconnu"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-bgs-gray-medium" />
                      {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(payment.total_scheduled_amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {payment.investors_count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    {payment.cumulative_amount !== null ? (
                      <span className="font-medium text-bgs-blue">
                        {formatCurrency(payment.cumulative_amount)}
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
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-bgs-gray-medium">
                Aucun versement programmé trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

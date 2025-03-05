
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
import { Calendar, Euro, SortAsc, SortDesc } from "lucide-react";
import { Project } from "@/types/project";
import { PaymentRecord } from "./types";

interface PaymentsTableProps {
  filteredAndSortedPayments: PaymentRecord[];
  cumulativeReturns: (PaymentRecord & { cumulativeReturn: number })[];
  sortColumn: string;
  sortDirection: "asc" | "desc";
  handleSort: (column: string) => void;
  userInvestments: Project[];
}

export default function PaymentsTable({ 
  filteredAndSortedPayments,
  cumulativeReturns,
  sortColumn,
  sortDirection,
  handleSort,
  userInvestments
}: PaymentsTableProps) {
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
            <TableHead>Cumulé</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedPayments.map((payment) => {
            // Find cumulative value for this payment if it's paid
            const cumulativeRecord = payment.status === 'paid' 
              ? cumulativeReturns.find(record => record.id === payment.id)
              : null;
            
            return (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <img
                      src={userInvestments.find(p => p.id === payment.projectId)?.image}
                      alt={payment.projectName}
                      className="h-6 w-6 rounded-md object-cover mr-2"
                    />
                    {payment.projectName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-bgs-gray-medium" />
                    {format(payment.date, "dd/MM/yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Euro className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                    <span className="text-green-600 font-medium">{payment.amount} €</span>
                  </div>
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
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    payment.status === 'paid' 
                      ? 'bg-green-100 text-green-600' 
                      : payment.status === 'pending'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {payment.status === 'paid' ? 'Payé' : payment.status === 'pending' ? 'En attente' : 'Programmé'}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
          {filteredAndSortedPayments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-bgs-gray-medium">
                Aucun versement trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

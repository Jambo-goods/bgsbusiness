
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
import { Check, Clock, AlertCircle, Calendar } from "lucide-react";
import { Project } from "@/types/project";
import { PaymentRecord } from "./types";

interface ExpectedReturnsTableProps {
  paymentRecords: PaymentRecord[];
  cumulativeExpectedReturns: (PaymentRecord & { expectedCumulativeReturn: number })[];
  userInvestments: Project[];
}

export default function ExpectedReturnsTable({ 
  paymentRecords,
  cumulativeExpectedReturns,
  userInvestments
}: ExpectedReturnsTableProps) {
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

  // Sort payments chronologically for this table
  const sortedPayments = [...paymentRecords].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Map payments to include expected cumulative values
  const paymentsWithExpectedCumulative = sortedPayments.map(payment => {
    const cumulativeData = cumulativeExpectedReturns.find(item => item.id === payment.id);
    return {
      ...payment,
      expectedCumulativeReturn: cumulativeData?.expectedCumulativeReturn || 0
    };
  });
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Projet</TableHead>
            <TableHead>Date de versement</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Pourcentage</TableHead>
            <TableHead>Cumulé prévu</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentsWithExpectedCumulative.map((payment) => {
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
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-bgs-gray-medium" />
                    {format(new Date(payment.date), "dd/MM/yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${isProjectedPayment ? 'text-purple-600' : 
                    payment.status === 'paid' ? 'text-green-600' : 
                    payment.status === 'pending' ? 'text-orange-600' : 'text-blue-600'}`}>
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
                  <span className="font-medium text-bgs-blue">
                    {Math.round(payment.expectedCumulativeReturn)} €
                  </span>
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
          {paymentsWithExpectedCumulative.length === 0 && (
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

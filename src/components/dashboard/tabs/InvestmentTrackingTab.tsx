
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { 
  Calendar,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Euro
} from "lucide-react";
import { Project } from "@/types/project";

interface InvestmentTrackingTabProps {
  userInvestments: Project[];
}

interface PaymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  date: Date;
  type: 'yield' | 'capital';
  status: 'paid' | 'pending' | 'scheduled';
}

export default function InvestmentTrackingTab({ userInvestments }: InvestmentTrackingTabProps) {
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Generate sample payment records based on user investments
  const generatePayments = (): PaymentRecord[] => {
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
  
  const [paymentRecords] = useState<PaymentRecord[]>(generatePayments());
  
  // Calculate cumulative returns
  const calculateCumulativeReturns = () => {
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
  
  const cumulativeReturns = calculateCumulativeReturns();
  
  // Filter and sort payment records
  const filteredAndSortedPayments = [...paymentRecords]
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
  
  // Toggle sort direction when clicking on a column header
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Calculate total returns
  const totalPaid = paymentRecords
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPending = paymentRecords
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-lg font-medium text-bgs-blue">
            Suivi des rendements
          </h2>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-bgs-orange"
            >
              <option value="all">Tous les statuts</option>
              <option value="paid">Payés</option>
              <option value="pending">En attente</option>
              <option value="scheduled">Programmés</option>
            </select>
            
            <button className="p-1.5 rounded-md border border-gray-200 text-bgs-gray-medium hover:bg-gray-50">
              <Filter className="h-3.5 w-3.5" />
            </button>
            
            <button className="p-1.5 rounded-md border border-gray-200 text-bgs-gray-medium hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-bgs-gray-medium">Total des rendements perçus</p>
            <p className="text-lg font-medium text-bgs-blue">{totalPaid} €</p>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-md">
            <p className="text-xs text-bgs-gray-medium">Rendements en attente</p>
            <p className="text-lg font-medium text-bgs-orange">{totalPending} €</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs text-bgs-gray-medium">Rendement mensuel moyen</p>
            <p className="text-lg font-medium text-green-600">
              {Math.round(totalPaid / Math.max(cumulativeReturns.length, 1))} €
            </p>
          </div>
        </div>
        
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
      </div>
    </div>
  );
}

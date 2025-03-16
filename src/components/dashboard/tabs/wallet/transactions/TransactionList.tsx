
import React, { useMemo } from "react";
import { Loader2, TrendingUp, BarChart3, Calendar, CheckCircle, Clock, AlertCircle, DollarSign, PercentIcon, ChevronRight } from "lucide-react";
import TransactionItem from "./TransactionItem";
import { Transaction } from "./types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Chart, ChartContainer, ChartTooltip } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export default function TransactionList({ 
  transactions,
  isLoading, 
  error 
}: TransactionListProps) {
  // Sample yield projection data
  const projectedYields = useMemo(() => {
    const baseMonthlyYield = 2000; // Example base monthly yield
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const randomVariation = Math.random() * 200 - 100; // Random variation between -100 and +100
      const monthlyYield = baseMonthlyYield + randomVariation;
      const cumulativeYield = baseMonthlyYield * month + randomVariation * (month / 2);
      
      return {
        month: `M${month}`,
        monthlyYield: Math.round(monthlyYield),
        cumulativeYield: Math.round(cumulativeYield)
      };
    });
  }, []);
  
  // Sample investment data
  const investments = useMemo(() => [
    { id: 1, name: "Projet Alpha", amount: 10000, yield: 12, monthlyReturn: 100 },
    { id: 2, name: "Projet Beta", amount: 5000, yield: 8, monthlyReturn: 33 },
    { id: 3, name: "Projet Gamma", amount: 15000, yield: 10, monthlyReturn: 125 }
  ], []);
  
  // Sample statistics
  const stats = useMemo(() => ({
    totalReceived: 1450,
    totalPending: 850,
    averageMonthlyReturn: 258,
    annualProjectedReturn: 3096
  }), []);
  
  // Sample upcoming payments
  const upcomingPayments = useMemo(() => [
    { id: "p1", date: new Date(2024, 5, 5), project: "Projet Alpha", amount: 100, cumulative: 350, status: "scheduled" },
    { id: "p2", date: new Date(2024, 6, 5), project: "Projet Beta", amount: 33, cumulative: 383, status: "scheduled" },
    { id: "p3", date: new Date(2024, 7, 5), project: "Projet Gamma", amount: 125, cumulative: 508, status: "scheduled" },
    { id: "p4", date: new Date(2024, 8, 5), project: "Projet Alpha", amount: 100, cumulative: 608, status: "scheduled" }
  ], []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-8 w-8 text-bgs-blue animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return <p className="text-center py-6 text-red-500">{error}</p>;
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
        <p className="text-bgs-gray-medium mb-2">
          Aucune transaction récente à afficher
        </p>
        <p className="text-sm text-gray-500">
          Les transactions apparaîtront ici une fois que vous effectuerez des dépôts ou des retraits.
        </p>
      </div>
    );
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    // Format the date as a string to use as the group key
    const dateKey = transaction.raw_timestamp 
      ? format(new Date(transaction.raw_timestamp), 'dd MMMM yyyy', { locale: fr })
      : format(new Date(transaction.created_at), 'dd MMMM yyyy', { locale: fr });
    
    // Create the group if it doesn't exist
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    // Add the transaction to the group
    groups[dateKey].push(transaction);
    
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="space-y-10">
      {/* Transactions Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Historique des transactions</h2>
        {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
          <div key={date} className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase">{date}</h3>
            <div className="space-y-3">
              {dateTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Yield Projection Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-50 p-2.5 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Projection de rendement</h2>
            <p className="text-xs text-gray-500 mt-0.5">Évolution prévue sur les 12 prochains mois</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center mb-2">
              <div className="bg-green-100 p-1.5 rounded-full mr-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-green-700">Total des versements perçus</p>
            </div>
            <p className="text-lg font-medium text-green-700">{stats.totalReceived.toFixed(2)} €</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center mb-2">
              <div className="bg-yellow-100 p-1.5 rounded-full mr-2">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-xs text-yellow-700">Total des versements en attente</p>
            </div>
            <p className="text-lg font-medium text-yellow-700">{stats.totalPending.toFixed(2)} €</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-blue-700">Rendement mensuel moyen</p>
            </div>
            <p className="text-lg font-medium text-blue-700">{stats.averageMonthlyReturn} €</p>
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Projections sur 12 mois</h3>
                <p className="text-sm text-blue-600">Évolution de vos rendements sur une année</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Mensuel</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Cumulé</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectedYields}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                <Tooltip 
                  formatter={(value, name) => {
                    return [`${value} €`, name === 'monthlyYield' ? 'Rendement mensuel' : 'Rendement cumulé'];
                  }}
                />
                <Legend 
                  payload={[
                    { value: 'Rendement mensuel', type: 'square', id: 'monthlyYield', color: '#3B82F6' },
                    { value: 'Rendement cumulé', type: 'square', id: 'cumulativeYield', color: '#10B981' },
                  ]}
                />
                <Bar yAxisId="left" dataKey="monthlyYield" fill="#3B82F6" name="Rendement mensuel" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="cumulativeYield" fill="#10B981" name="Rendement cumulé" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between mt-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Rendement mensuel moyen</p>
              <p className="text-sm font-medium text-blue-600">{stats.averageMonthlyReturn} €</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Rendement annuel projeté</p>
              <p className="text-sm font-medium text-green-600">{stats.annualProjectedReturn} €</p>
            </div>
          </div>
        </div>
        
        {/* Investment Cards */}
        <h3 className="text-md font-semibold text-gray-800 mb-4">Détails de vos investissements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {investments.map(investment => (
            <div key={investment.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-blue-600">{investment.name}</h4>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Actif</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500 mb-1">Montant investi</p>
                  <p className="font-medium">{investment.amount} €</p>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-xs text-gray-500 mb-1">Rendement</p>
                  <p className="font-medium text-green-600">{investment.yield}%</p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Revenu mensuel</p>
                  <p className="text-sm font-medium text-green-600">{investment.monthlyReturn} €</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Upcoming Payments Table */}
        <h3 className="text-md font-semibold text-gray-800 mb-4">Prochains versements prévus</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumul</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {payment.date.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    {payment.project}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.amount} €
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                    {payment.cumulative} €
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Programmé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Ces projections sont basées sur les taux de rendement actuels de vos investissements et peuvent varier. 
            Les versements sont généralement effectués le 5 de chaque mois, après la période de délai initial spécifiée dans chaque projet.
          </p>
        </div>
      </div>
    </div>
  );
}

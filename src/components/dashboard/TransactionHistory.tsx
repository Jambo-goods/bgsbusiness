
import { useState } from "react";
import { Calendar, ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "investment" | "return";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  description: string;
}

// Sample transaction data (in a real app, this would come from an API)
const sampleTransactions: Transaction[] = [
  {
    id: "tr-001",
    type: "deposit",
    amount: 5000,
    date: "2023-10-15",
    status: "completed",
    description: "Dépôt initial"
  },
  {
    id: "tr-002",
    type: "investment",
    amount: -2500,
    date: "2023-10-20",
    status: "completed",
    description: "Investissement - BGS Wood Africa"
  },
  {
    id: "tr-003",
    type: "return",
    amount: 31.25,
    date: "2023-11-20",
    status: "completed",
    description: "Rendement mensuel - BGS Wood Africa"
  },
  {
    id: "tr-004",
    type: "return",
    amount: 31.25,
    date: "2023-12-20",
    status: "completed",
    description: "Rendement mensuel - BGS Wood Africa"
  },
  {
    id: "tr-005",
    type: "deposit",
    amount: 3000,
    date: "2024-01-05",
    status: "completed",
    description: "Dépôt supplémentaire"
  },
  {
    id: "tr-006",
    type: "investment",
    amount: -2500,
    date: "2024-01-10",
    status: "completed",
    description: "Investissement - BGS Energy"
  },
  {
    id: "tr-007",
    type: "return",
    amount: 62.5,
    date: "2024-01-20",
    status: "completed",
    description: "Rendement mensuel - BGS Wood Africa, BGS Energy"
  },
  {
    id: "tr-008",
    type: "return",
    amount: 62.5,
    date: "2024-02-20",
    status: "completed",
    description: "Rendement mensuel - BGS Wood Africa, BGS Energy"
  },
  {
    id: "tr-009",
    type: "withdrawal",
    amount: -1000,
    date: "2024-03-05",
    status: "pending",
    description: "Retrait vers compte bancaire"
  }
];

export default function TransactionHistory() {
  const [transactions] = useState<Transaction[]>(sampleTransactions);
  const [filter, setFilter] = useState<"all" | "deposits" | "withdrawals" | "investments" | "returns">("all");
  
  // Format date to French locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === "all") return true;
    if (filter === "deposits") return transaction.type === "deposit";
    if (filter === "withdrawals") return transaction.type === "withdrawal";
    if (filter === "investments") return transaction.type === "investment";
    if (filter === "returns") return transaction.type === "return";
    return true;
  });

  // Get transaction icon based on type
  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft size={16} className="text-green-500" />;
      case "withdrawal":
        return <ArrowUpRight size={16} className="text-red-500" />;
      case "investment":
        return <ArrowUpRight size={16} className="text-orange-500" />;
      case "return":
        return <ArrowDownLeft size={16} className="text-green-500" />;
      default:
        return null;
    }
  };

  // Get transaction status badge
  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Effectué</span>;
      case "pending":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case "failed":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">Échoué</span>;
      default:
        return null;
    }
  };

  // Format amount with color based on positive/negative value
  const formatAmount = (amount: number) => {
    const formattedAmount = Math.abs(amount).toLocaleString() + " €";
    return amount >= 0 ? (
      <span className="text-green-500 font-semibold">+{formattedAmount}</span>
    ) : (
      <span className="text-red-500 font-semibold">-{formattedAmount}</span>
    );
  };

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-bgs-blue">
          Historique des transactions
        </h2>
        
        {/* Filter dropdown */}
        <div className="relative">
          <button className="text-sm flex items-center text-bgs-blue/70 hover:text-bgs-orange transition-colors">
            <Filter size={16} className="mr-1" />
            Filtrer
          </button>
          <select 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">Toutes les transactions</option>
            <option value="deposits">Dépôts</option>
            <option value="withdrawals">Retraits</option>
            <option value="investments">Investissements</option>
            <option value="returns">Rendements</option>
          </select>
        </div>
      </div>
      
      {filteredTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-bgs-blue/70 pb-2">Date</th>
                <th className="text-left text-xs font-medium text-bgs-blue/70 pb-2">Description</th>
                <th className="text-left text-xs font-medium text-bgs-blue/70 pb-2">Statut</th>
                <th className="text-right text-xs font-medium text-bgs-blue/70 pb-2">Montant</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type)}
                      <span className="ml-2 text-sm text-bgs-blue/70">
                        {formatDate(transaction.date)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-bgs-blue">{transaction.description}</span>
                  </td>
                  <td className="py-3">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="py-3 text-right">
                    {formatAmount(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-bgs-blue/60">
          Aucune transaction correspondant au filtre sélectionné.
        </div>
      )}
    </div>
  );
}


import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Transaction } from "../types/investment";
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Clock } from "lucide-react";

interface TransactionHistoryCardProps {
  transactions: Transaction[];
}

export default function TransactionHistoryCard({ transactions }: TransactionHistoryCardProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  };
  
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'yield':
        return 'Gain reçu';
      case 'investment':
        return 'Investissement';
      case 'deposit':
        return 'Dépôt';
      case 'withdrawal':
        return 'Retrait';
      default:
        return type;
    }
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'yield':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'investment':
        return <PiggyBank className="h-4 w-4 text-blue-500" />;
      case 'deposit':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getAmountColor = (type: string) => {
    switch (type) {
      case 'yield':
      case 'deposit':
        return 'text-green-600';
      case 'investment':
      case 'withdrawal':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'yield':
      case 'deposit':
        return '+';
      case 'investment':
      case 'withdrawal':
        return '-';
      default:
        return '';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">Aucune transaction trouvée</TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      {getTransactionTypeLabel(transaction.type)}
                    </div>
                  </TableCell>
                  <TableCell className={getAmountColor(transaction.type)}>
                    {getAmountPrefix(transaction.type)}{transaction.amount}€
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status === 'completed' ? '✓ Confirmé' : '⏳ En attente'}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

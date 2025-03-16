
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Transaction } from "../types/investment";

interface TransactionHistoryCardProps {
  transactions: Transaction[];
  investmentId?: string;
}

export default function TransactionHistoryCard({ transactions, investmentId }: TransactionHistoryCardProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  };
  
  // Filtrer les transactions liées à cet investissement
  const filteredTransactions = investmentId 
    ? transactions.filter(tx => tx.investment_id === investmentId)
    : transactions;
  
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
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>{transaction.type === 'yield' ? 'Gain reçu' : 'Investissement'}</TableCell>
                  <TableCell className={transaction.type === 'yield' ? 'text-green-600' : 'text-red-600'}>
                    {transaction.type === 'yield' ? '+' : '-'}{transaction.amount}€
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
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  Aucune transaction trouvée pour cet investissement
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

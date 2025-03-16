
import React, { useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Transaction } from "../types/investment";
import { calculateReturns } from "@/utils/investmentCalculations";

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
  
  // Calculer le rendement total reçu
  const totalYieldReceived = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.type === 'yield' && tx.status === 'completed')
      .reduce((total, tx) => total + tx.amount, 0);
  }, [filteredTransactions]);
  
  // Obtenir le montant de l'investissement
  const investmentAmount = useMemo(() => {
    const investmentTx = filteredTransactions.find(tx => tx.type === 'investment');
    return investmentTx ? investmentTx.amount : 0;
  }, [filteredTransactions]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {investmentAmount > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Programme de rendement mensuel</h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-700">Montant investi: <span className="font-medium">{investmentAmount}€</span></p>
                <p className="text-sm text-blue-700">Rendement mensuel prévu: <span className="font-medium">{(investmentAmount * 0.08 / 12).toFixed(2)}€</span></p>
              </div>
              <div>
                <p className="text-sm text-green-700">Rendement déjà reçu: <span className="font-medium">{totalYieldReceived}€</span></p>
              </div>
            </div>
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Rendement mensuel</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => {
                // Calculer le rendement mensuel (uniquement pour les transactions de type yield)
                const monthlyYield = transaction.type === 'yield' 
                  ? transaction.amount 
                  : '-';

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{transaction.type === 'yield' ? 'Gain reçu' : 'Investissement'}</TableCell>
                    <TableCell className={transaction.type === 'yield' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'yield' ? '+' : '-'}{transaction.amount}€
                    </TableCell>
                    <TableCell className={transaction.type === 'yield' ? 'text-green-600' : 'text-gray-400'}>
                      {transaction.type === 'yield' ? `${monthlyYield}€` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? '✓ Confirmé' : '⏳ En attente'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
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

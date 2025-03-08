
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Upload, Download } from 'lucide-react';

interface TransactionsTabProps {
  isLoading: boolean;
  transactions: any[];
  profiles: any[];
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({
  isLoading,
  transactions,
  profiles
}) => {
  const formatAmount = (amount: number, type?: string) => {
    if (type) {
      return type === 'deposit' ? `+${amount.toLocaleString()} €` : `-${amount.toLocaleString()} €`;
    }
    return `${amount.toLocaleString()} €`;
  };

  const getAmountClass = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' 
      ? <Upload className="h-4 w-4 text-green-600" /> 
      : <Download className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-bgs-blue" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          Aucune transaction trouvée
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const profile = profiles.find(p => p.id === transaction.user_id) || {};
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <span className="ml-2">
                          {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                        <div className="text-sm text-gray-500">{profile.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className={`font-medium ${getAmountClass(transaction.type)}`}>
                      {formatAmount(transaction.amount, transaction.type)}
                    </TableCell>
                    <TableCell>
                      {transaction.description || '-'}
                    </TableCell>
                    <TableCell>
                      {transaction.created_at ? new Date(transaction.created_at).toLocaleString('fr-FR') : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;

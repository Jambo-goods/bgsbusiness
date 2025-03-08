
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WithdrawalsTabProps {
  isLoading: boolean;
  filteredWithdrawals: any[];
  profiles: any[];
  handleApproveWithdrawal: (withdrawal: any) => void;
  handleRejectWithdrawal: (withdrawal: any) => void;
}

const WithdrawalsTab: React.FC<WithdrawalsTabProps> = ({
  isLoading,
  filteredWithdrawals,
  profiles,
  handleApproveWithdrawal,
  handleRejectWithdrawal
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-bgs-blue" />
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          Aucune demande de retrait trouvée
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date de demande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de traitement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((withdrawal) => {
                const profile = profiles.find(p => p.id === withdrawal.user_id) || {};
                return (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                        <div className="text-sm text-gray-500">{profile.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{withdrawal.amount?.toLocaleString()} €</TableCell>
                    <TableCell>
                      {withdrawal.requested_at ? new Date(withdrawal.requested_at).toLocaleString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(withdrawal.status)}
                    </TableCell>
                    <TableCell>
                      {withdrawal.processed_at ? new Date(withdrawal.processed_at).toLocaleString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {withdrawal.status === 'pending' ? (
                        <div className="flex justify-end items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveWithdrawal(withdrawal)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectWithdrawal(withdrawal)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Traité</span>
                      )}
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

export default WithdrawalsTab;

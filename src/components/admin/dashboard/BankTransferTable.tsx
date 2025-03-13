
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BankTransferTableProps {
  pendingTransfers: any[];
  isLoading: boolean;
  refreshData: () => void;
}

const BankTransferTable: React.FC<BankTransferTableProps> = ({
  pendingTransfers,
  isLoading,
  refreshData
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Utilisateur</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              Chargement des données...
            </TableCell>
          </TableRow>
        ) : pendingTransfers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              Aucun virement bancaire en attente
            </TableCell>
          </TableRow>
        ) : (
          pendingTransfers.map((transfer) => (
            <TableRow key={transfer.id}>
              <TableCell className="font-mono text-xs">{transfer.id.substring(0, 8)}...</TableCell>
              <TableCell>{new Date(transfer.created_at).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>{transfer.user_name || 'Utilisateur inconnu'}</TableCell>
              <TableCell>{transfer.amount} €</TableCell>
              <TableCell>{transfer.status}</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default BankTransferTable;

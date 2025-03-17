import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WithdrawalRequest } from "@/types";
import { formatDate, formatTime } from "@/components/dashboard/tabs/wallet/withdrawal-table/formatUtils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoadingState, EmptyState } from "@/components/dashboard/tabs/wallet/withdrawal-table/RequestStates";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notificationService } from "@/services/notifications";

interface WithdrawalRequestsTableProps {
  withdrawalRequests: WithdrawalRequest[];
  isLoading: boolean;
}

export default function WithdrawalRequestsTable({ withdrawalRequests, isLoading }: WithdrawalRequestsTableProps) {
  const navigate = useNavigate();
  
  const handleNewWithdrawal = () => {
    navigate("/dashboard?tab=wallet&action=withdraw");
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!withdrawalRequests || withdrawalRequests.length === 0) {
    return (
      <EmptyState onNewWithdrawal={handleNewWithdrawal} />
    );
  }
  
  // Function to get CSS class based on status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-700 bg-amber-100';
      case 'scheduled':
        return 'text-blue-700 bg-blue-100';
      case 'processing':
        return 'text-purple-700 bg-purple-100';
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };
  
  // Function to get human-readable status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'scheduled':
        return 'Planifié';
      case 'processing':
        return 'En traitement';
      case 'completed':
        return 'Complété';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };
  
  // Function to determine if a withdrawal is cancelable
  const isCancelable = (status: string) => {
    return ['pending', 'scheduled'].includes(status);
  };
  
  const cancelWithdrawal = async (id: string) => {
    try {
      // Update the withdrawal status to 'canceled'
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'canceled' })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Show success message
      toast.success("Retrait annulé avec succès");
      
      // Create notification
      notificationService.createNotification({
        type: 'withdrawal',
        title: 'Retrait annulé',
        message: 'Votre demande de retrait a été annulée.'
      });
    } catch (error) {
      console.error("Erreur lors de l'annulation du retrait:", error);
      toast.error("Une erreur est survenue lors de l'annulation");
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date de traitement</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawalRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div className="font-medium">{formatDate(request.created_at)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(request.created_at)}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {request.amount} €
              </TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(request.status)}`}>
                  {getStatusLabel(request.status)}
                </div>
              </TableCell>
              <TableCell>
                {request.processed_at ? (
                  <div>
                    <div className="font-medium">{formatDate(request.processed_at)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(request.processed_at)}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {isCancelable(request.status) ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => cancelWithdrawal(request.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100"
                  >
                    Annuler
                  </Button>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, CheckCircleIcon, ReceiptIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StatusIndicator from "./StatusIndicator";
import { logAdminAction } from "@/services/adminAuthService";
import { Input } from "@/components/ui/input";
import { notificationService } from "@/services/notifications";

interface BankTransferItem {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  description: string;
  status: string;
  receipt_confirmed?: boolean;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

interface BankTransferTableProps {
  pendingTransfers: BankTransferItem[];
  isLoading: boolean;
  refreshData: () => void;
}

export default function BankTransferTable({ 
  pendingTransfers, 
  isLoading, 
  refreshData 
}: BankTransferTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleConfirmDeposit = async (item: BankTransferItem, amount: number) => {
    try {
      if (!amount || amount <= 0) {
        toast.error("Veuillez saisir un montant valide supérieur à zéro");
        return;
      }

      setProcessingId(item.id);
      
      // Get current admin information
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      // 1. Update the wallet transaction status to completed and set the amount
      await supabase
        .from('wallet_transactions')
        .update({ 
          status: 'completed',
          amount: amount
        })
        .eq('id', item.id);
      
      // 2. Increment the user's wallet balance
      await supabase.rpc('increment_wallet_balance', {
        user_id: item.user_id,
        increment_amount: amount
      });
      
      // 3. Create a notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Dépôt confirmé",
          description: `Votre dépôt de ${amount}€ a été validé et ajouté à votre portefeuille.`,
          type: "deposit",
          category: "success",
          metadata: {
            amount,
            transaction_id: item.id
          }
        });
      
      // 4. Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Confirmation de dépôt de ${amount}€`,
          item.user_id,
          undefined,
          amount
        );
      }
      
      toast.success("Dépôt confirmé avec succès");
      refreshData();
    } catch (error) {
      console.error("Erreur lors de la confirmation du dépôt:", error);
      toast.error("Une erreur est survenue lors de la confirmation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectDeposit = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      
      // Get current admin information
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      // 1. Update the wallet transaction status to rejected
      await supabase
        .from('wallet_transactions')
        .update({ status: 'rejected' })
        .eq('id', item.id);
      
      // 2. Create a notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: item.user_id,
          title: "Dépôt rejeté",
          description: "Votre demande de dépôt n'a pas pu être validée. Veuillez contacter le support pour plus d'informations.",
          type: "deposit",
          category: "error"
        });
      
      // 3. Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Rejet de demande de dépôt`,
          item.user_id
        );
      }
      
      toast.success("Dépôt rejeté");
      refreshData();
    } catch (error) {
      console.error("Erreur lors du rejet du dépôt:", error);
      toast.error("Une erreur est survenue lors du rejet");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReceipt = async (item: BankTransferItem) => {
    try {
      setProcessingId(item.id);
      
      // Get current admin information
      const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
      
      // Update the wallet transaction with receipt confirmation
      await supabase
        .from('wallet_transactions')
        .update({ receipt_confirmed: true })
        .eq('id', item.id);
      
      // Log admin action
      if (adminUser.id) {
        await logAdminAction(
          adminUser.id,
          'wallet_management',
          `Confirmation de réception de virement - Réf: ${item.description}`,
          item.user_id
        );
      }
      
      toast.success("Réception de virement confirmée");
      refreshData();
    } catch (error) {
      console.error("Erreur lors de la confirmation de réception:", error);
      toast.error("Une erreur est survenue lors de la confirmation de réception");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgs-blue"></div>
      </div>
    );
  }

  if (pendingTransfers.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-500">Aucun virement bancaire en attente de confirmation</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Réception</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingTransfers.map((item) => {
            // Extract reference from description if available
            const referenceMatch = item.description.match(/\(réf: (.+?)\)/);
            const reference = referenceMatch ? referenceMatch[1] : "N/A";
            
            // Format date
            const date = new Date(item.created_at);
            const formattedDate = date.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{formattedDate}</div>
                  <Badge variant="outline" className="mt-1">
                    {item.status === 'pending' ? 'En attente' : item.status === 'completed' ? 'Confirmé' : 'Rejeté'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {item.profile?.first_name} {item.profile?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{item.profile?.email}</div>
                </TableCell>
                <TableCell>
                  <div className="font-mono font-medium">{reference}</div>
                </TableCell>
                <TableCell>
                  {item.receipt_confirmed ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">Virement reçu</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200"
                      onClick={() => handleConfirmReceipt(item)}
                      disabled={processingId === item.id}
                    >
                      <ReceiptIcon className="h-4 w-4 mr-1" />
                      Confirmer réception
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {item.status === 'pending' && (
                    <div className="flex justify-end gap-2">
                      <Input 
                        type="number" 
                        placeholder="Montant" 
                        className="w-24 px-2 py-1 border rounded-md"
                        id={`amount-${item.id}`}
                        min="100"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                        onClick={() => {
                          const inputElem = document.getElementById(`amount-${item.id}`) as HTMLInputElement;
                          const amount = parseInt(inputElem.value, 10);
                          handleConfirmDeposit(item, amount);
                        }}
                        disabled={processingId === item.id || !item.receipt_confirmed}
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Confirmer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        onClick={() => handleRejectDeposit(item)}
                        disabled={processingId === item.id}
                      >
                        <XIcon className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                  {item.status !== 'pending' && (
                    <Badge variant={item.status === 'completed' ? 'success' : 'destructive'}>
                      {item.status === 'completed' ? 'Traité' : 'Rejeté'}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

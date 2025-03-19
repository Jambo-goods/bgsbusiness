
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BankTransferItem } from "./types/bankTransfer";
import { StatusBadge } from "./bank-transfer/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { useBankTransfers } from "./hooks/useBankTransfers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BankTransferTableRowProps {
  item: BankTransferItem;
  processingId: string | null;
  onStatusUpdate?: () => void;
}

export default function BankTransferTableRow({
  item,
  processingId,
  onStatusUpdate
}: BankTransferTableRowProps) {
  const { updateTransferStatus } = useBankTransfers();
  const [localProcessing, setLocalProcessing] = useState(false);
  
  // Format date nicely
  const formattedDate = item.created_at 
    ? format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: fr })
    : 'Date inconnue';
    
  const isProcessing = processingId === item.id || localProcessing;
  
  const userName = item.profile 
    ? `${item.profile.first_name || ''} ${item.profile.last_name || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur inconnu';

  const isReceiptConfirmed = item.processed === true;
  const isRejected = item.status === 'rejected';
  const isPending = item.status === 'pending';
  const hasMisspelledStatus = item.status === 'receveid'; // Handle this specific case
  
  // Handle confirming receipt using the edge function
  const handleConfirmReceipt = async () => {
    if (isProcessing) return;
    
    setLocalProcessing(true);
    toast.info("Traitement en cours...");
    
    try {
      // Try the new edge function first
      const session = await supabase.auth.getSession();
      const adminToken = session.data.session?.access_token;
      
      // Call the edge function
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
        'update-bank-transfer',
        {
          body: {
            transferId: item.id,
            status: 'received',
            isProcessed: true,
            notes: `Réception confirmée le ${new Date().toLocaleDateString('fr-FR')}`,
            userId: item.user_id
          }
        }
      );
      
      if (edgeFunctionError) {
        console.error("Erreur fonction edge:", edgeFunctionError);
        
        // Fallback to local service if edge function fails
        const success = await updateTransferStatus(item, 'received');
        if (success && onStatusUpdate) {
          toast.success("Virement marqué comme reçu");
          onStatusUpdate();
        } else {
          toast.error("Échec de la mise à jour - veuillez réessayer");
        }
      } else {
        console.log("Résultat fonction edge:", edgeFunctionData);
        
        if (edgeFunctionData.success) {
          toast.success("Virement marqué comme reçu");
          if (onStatusUpdate) onStatusUpdate();
        } else {
          toast.error(`Échec de la mise à jour: ${edgeFunctionData.error || 'Erreur inconnue'}`);
        }
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour");
    } finally {
      setTimeout(() => setLocalProcessing(false), 500);
    }
  };
  
  // Handle rejecting transfer using the edge function
  const handleRejectTransfer = async () => {
    if (isProcessing) return;
    
    setLocalProcessing(true);
    toast.info("Traitement du rejet en cours...");
    
    try {
      // Call the edge function
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
        'update-bank-transfer',
        {
          body: {
            transferId: item.id,
            status: 'rejected',
            isProcessed: true,
            notes: `Virement rejeté le ${new Date().toLocaleDateString('fr-FR')}`,
            userId: item.user_id
          }
        }
      );
      
      if (edgeFunctionError) {
        console.error("Erreur fonction edge:", edgeFunctionError);
        
        // Fallback to local service if edge function fails
        const success = await updateTransferStatus(item, 'rejected');
        if (success && onStatusUpdate) {
          toast.success("Virement rejeté");
          onStatusUpdate();
        } else {
          toast.error("Échec du rejet - veuillez réessayer");
        }
      } else {
        console.log("Résultat fonction edge:", edgeFunctionData);
        
        if (edgeFunctionData.success) {
          toast.success("Virement rejeté avec succès");
          if (onStatusUpdate) onStatusUpdate();
        } else {
          toast.error(`Échec du rejet: ${edgeFunctionData.error || 'Erreur inconnue'}`);
        }
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast.error("Une erreur s'est produite lors du rejet");
    } finally {
      setTimeout(() => setLocalProcessing(false), 500);
    }
  };
  
  return (
    <TableRow className={isProcessing ? "bg-gray-50" : ""}>
      <TableCell className="font-medium">
        {formattedDate}
        <div className="text-xs text-gray-500">Ref: {item.reference || 'N/A'}</div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col">
          <span>{userName}</span>
          <span className="text-xs text-gray-500">{item.profile?.email || 'Email inconnu'}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col">
          <span>{item.reference || 'N/A'}</span>
          <span className="text-xs text-gray-500">
            {item.description || `Virement - ${item.amount || 0}€`}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusBadge
            status={item.status}
            hasMisspelledStatus={hasMisspelledStatus}
            isProcessed={!!item.processed}
          />
          
          {isPending && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
                onClick={handleConfirmReceipt}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5 mr-1" />
                )}
                Reçu
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="h-7 bg-red-50 border-red-200 hover:bg-red-100 text-red-700"
                onClick={handleRejectTransfer}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5 mr-1" />
                )}
                Rejeter
              </Button>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

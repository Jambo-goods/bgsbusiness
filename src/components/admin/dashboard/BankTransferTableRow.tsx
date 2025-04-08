import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BankTransferItem } from "./types/bankTransfer";
import { StatusBadge } from "./bank-transfer/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Edit, Calendar, RefreshCw, AlertTriangle } from "lucide-react";
import { useBankTransfers } from "./hooks/useBankTransfers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { edgeFunctionService } from "./services/edgeFunctionService";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { updateTransferStatus, restoreTransfer } = useBankTransfers();
  const [localProcessing, setLocalProcessing] = useState(false);
  const [lastActionTime, setLastActionTime] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>(item.status || 'pending');
  const [processedDate, setProcessedDate] = useState<Date | undefined>(
    item.processed_at ? new Date(item.processed_at) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  
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
  const canBeRestored = (item.status === 'rejected' || item.status === 'cancelled' || isReceiptConfirmed);
  
  const shouldPreventAction = () => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTime;
    
    if (timeSinceLastAction < 5000) { // 5 seconds cooldown
      console.log(`Action prevented: Only ${timeSinceLastAction}ms since last action`);
      return true;
    }
    
    setLastActionTime(now);
    return false;
  };

  const handleConfirmReceipt = async () => {
    if (isProcessing || shouldPreventAction()) return;
    
    setLocalProcessing(true);
    toast.info("Traitement en cours...");
    
    try {
      console.log(`Confirming receipt for transfer ${item.id}`);
      
      const { success, data, message, error } = await edgeFunctionService.invokeUpdateTransferEdgeFunction(
        item.id,
        'completed', // Always use 'completed' instead of 'received'
        item.user_id,
        true,
        true // Credit wallet
      );
      
      if (success) {
        toast.success("Virement marqué comme complété et solde mis à jour");
        if (onStatusUpdate) {
          setTimeout(() => {
            onStatusUpdate();
          }, 1000);
        }
      } else {
        console.error("Error confirming receipt:", message || "Unknown error");
        toast.error(`Échec de la mise à jour: ${message || 'Erreur inconnue'}`);
        
        // Fallback to direct update
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', item.user_id)
            .single();
            
          if (!profileError && profileData) {
            console.log("Current wallet balance:", profileData.wallet_balance);
            
            const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
              user_id: item.user_id,
              increment_amount: item.amount || 0
            });
            
            if (walletError) {
              console.error("Failed to update wallet balance:", walletError);
              
              const { error: directUpdateError } = await supabase
                .from('profiles')
                .update({ wallet_balance: (profileData.wallet_balance || 0) + (item.amount || 0) })
                .eq('id', item.user_id);
                
              if (directUpdateError) {
                console.error("Direct balance update failed:", directUpdateError);
              } else {
                console.log(`Wallet balance directly updated to ${(profileData.wallet_balance || 0) + (item.amount || 0)}`);
              }
            } else {
              console.log(`Wallet balance updated by ${item.amount}`);
            }
          }
          
          const success = await updateTransferStatus(item, 'completed');
          if (success && onStatusUpdate) {
            toast.success("Virement marqué comme complété et solde mis à jour");
            onStatusUpdate();
          } else {
            toast.error("Échec de la mise à jour - veuillez réessayer");
          }
        } catch (backupError) {
          console.error("Failed to use fallback:", backupError);
          toast.error("Erreur lors de la mise à jour de secours");
        }
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour");
    } finally {
      setTimeout(() => setLocalProcessing(false), 1000);
    }
  };
  
  const handleRejectTransfer = async () => {
    if (isProcessing || shouldPreventAction()) return;
    
    setLocalProcessing(true);
    toast.info("Traitement du rejet en cours...");
    
    try {
      console.log(`Rejecting transfer ${item.id}`);
      
      const { success, data, message, error } = await edgeFunctionService.invokeUpdateTransferEdgeFunction(
        item.id,
        'rejected',
        item.user_id,
        true,
        false // Don't credit wallet for rejected transfers
      );
      
      if (success) {
        toast.success("Virement rejeté avec succès");
        if (onStatusUpdate) {
          setTimeout(() => {
            onStatusUpdate();
          }, 1000);
        }
      } else {
        console.error("Error rejecting transfer:", message || "Unknown error");
        toast.error(`Échec du rejet: ${message || 'Erreur inconnue'}`);
        
        // Fallback to direct update with explicit cancelled status for wallet transaction
        try {
          // Vérifier s'il existe déjà une transaction wallet
          const { data: existingTx } = await supabase
            .from('wallet_transactions')
            .select('id, status')
            .eq('user_id', item.user_id)
            .ilike('description', `%${item.reference || ''}%`)
            .maybeSingle();
          
          if (existingTx && existingTx.status !== 'cancelled') {
            // Mettre à jour la transaction existante vers 'cancelled'
            await supabase
              .from('wallet_transactions')
              .update({ 
                status: 'cancelled',
                receipt_confirmed: false
              })
              .eq('id', existingTx.id);
            
            console.log(`Updated existing wallet transaction to cancelled: ${existingTx.id}`);
          } else if (!existingTx) {
            // Créer une nouvelle transaction cancelled
            const { error: newTxError } = await supabase
              .from('wallet_transactions')
              .insert({
                user_id: item.user_id,
                amount: item.amount,
                type: 'deposit',
                description: `Virement bancaire rejeté (${item.reference || ''})`,
                status: 'cancelled',
                receipt_confirmed: false
              });
              
            if (newTxError) {
              console.error("Failed to create cancelled wallet transaction:", newTxError);
            }
          }
          
          const success = await updateTransferStatus(item, 'rejected');
          if (success && onStatusUpdate) {
            toast.success("Virement rejeté");
            onStatusUpdate();
          } else {
            toast.error("Échec du rejet - veuillez réessayer");
          }
        } catch (backupError) {
          console.error("Failed to use fallback:", backupError);
          toast.error("Erreur lors de la mise à jour de secours");
        }
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast.error("Une erreur s'est produite lors du rejet");
    } finally {
      setTimeout(() => setLocalProcessing(false), 1000);
    }
  };

  const handleEditClick = () => {
    setEditStatus(item.status || 'pending');
    setProcessedDate(item.processed_at ? new Date(item.processed_at) : undefined);
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing || isSubmitting) return;
    
    setIsSubmitting(true);
    toast.info("Mise à jour en cours...");
    
    try {
      console.log(`Updating transfer ${item.id} with status ${editStatus} and processed date ${processedDate}`);
      
      // Convert 'received' to 'completed'
      const normalizedStatus = editStatus === 'reçu' ? 'completed' : editStatus === 'received' ? 'completed' : editStatus;
      
      const isProcessed = (normalizedStatus === 'completed' || normalizedStatus === 'rejected') || processedDate !== undefined;
      const shouldCreditWallet = normalizedStatus === 'completed';
      
      const { success, data, message, error } = await edgeFunctionService.invokeUpdateTransferEdgeFunction(
        item.id,
        normalizedStatus,
        item.user_id,
        isProcessed,
        shouldCreditWallet
      );
      
      if (success) {
        toast.success(shouldCreditWallet 
          ? "Virement mis à jour et solde utilisateur crédité"
          : "Virement mis à jour avec succès");
        setIsEditModalOpen(false);
        
        if (onStatusUpdate) {
          setTimeout(() => {
            onStatusUpdate();
          }, 1000);
        }
      } else {
        console.error("Error updating transfer:", message || "Unknown error");
        toast.error(`Échec de la mise à jour: ${message || 'Erreur inconnue'}`);
        
        if (shouldCreditWallet) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', item.user_id)
            .single();
            
          if (!profileError && profileData) {
            console.log("Current wallet balance:", profileData.wallet_balance);
            
            const { error: walletError } = await supabase.rpc('increment_wallet_balance', {
              user_id: item.user_id,
              increment_amount: item.amount || 0
            });
            
            if (walletError) {
              console.error("Failed to update wallet balance:", walletError);
              
              const { error: directUpdateError } = await supabase
                .from('profiles')
                .update({ wallet_balance: (profileData.wallet_balance || 0) + (item.amount || 0) })
                .eq('id', item.user_id);
                
              if (directUpdateError) {
                console.error("Direct balance update failed:", directUpdateError);
              } else {
                console.log(`Wallet balance directly updated to ${(profileData.wallet_balance || 0) + (item.amount || 0)}`);
              }
            } else {
              console.log(`Wallet balance updated by ${item.amount}`);
            }
          }
        }
        
        const processedDateStr = processedDate ? processedDate.toISOString() : null;
        const success = await updateTransferStatus(item, normalizedStatus, processedDateStr);
        
        if (success && onStatusUpdate) {
          toast.success(shouldCreditWallet 
            ? "Virement mis à jour et solde utilisateur crédité"
            : "Virement mis à jour avec succès");
          setIsEditModalOpen(false);
          onStatusUpdate();
        } else {
          toast.error("Échec de la mise à jour - veuillez réessayer");
        }
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreTransfer = async () => {
    if (isProcessing || shouldPreventAction()) return;
    
    setLocalProcessing(true);
    
    try {
      const success = await restoreTransfer(item);
      
      if (success && onStatusUpdate) {
        setTimeout(() => {
          onStatusUpdate();
        }, 1000);
      }
    } finally {
      setTimeout(() => setLocalProcessing(false), 1000);
    }
    
    setIsRestoreDialogOpen(false);
  };

  const openRestoreConfirmDialog = () => {
    setIsRestoreDialogOpen(true);
  };
  
  return (
    <TableRow className={isProcessing ? "bg-gray-50" : ""}>
      <TableCell className="font-medium">
        {formattedDate}
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
        <span className="font-medium">{item.amount || 0} €</span>
      </TableCell>
      
      <TableCell>
        <StatusBadge
          status={item.status}
          hasMisspelledStatus={hasMisspelledStatus}
          isProcessed={!!item.processed}
        />
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={handleEditClick}
            disabled={isProcessing}
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Modifier</span>
          </Button>
          
          {canBeRestored && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
              onClick={openRestoreConfirmDialog}
              disabled={isProcessing}
              title="Restaurer"
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
              )}
              <span className="hidden sm:inline">Restaurer</span>
            </Button>
          )}
          
          {isPending && (
            <>
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
                <span className="hidden sm:inline">Confirmer</span>
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
                <span className="hidden sm:inline">Rejeter</span>
              </Button>
            </>
          )}
        </div>
        
        <Dialog open={isEditModalOpen} onOpenChange={(open) => !open && setIsEditModalOpen(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier le virement</DialogTitle>
              <DialogDescription>
                Référence: {item.reference}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitEdit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="pending">En attente</option>
                  <option value="received">Reçu</option>
                  <option value="rejected">Rejeté</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="processedDate">Date de traitement</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="processedDate"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !processedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {processedDate ? format(processedDate, "P", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={processedDate}
                      onSelect={setProcessedDate}
                      initialFocus
                      locale={fr}
                    />
                    <div className="p-2 border-t border-gray-100">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-center"
                        onClick={() => setProcessedDate(undefined)}
                        type="button"
                      >
                        Effacer la date
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Mettre à jour"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restaurer le virement</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir restaurer ce virement ? 
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Référence :</span>
                    <span className="text-sm font-medium">{item.reference}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Montant :</span>
                    <span className="text-sm font-medium">{item.amount} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Statut actuel :</span>
                    <span className="text-sm font-medium">
                      <StatusBadge
                        status={item.status}
                        hasMisspelledStatus={hasMisspelledStatus}
                        isProcessed={!!item.processed}
                      />
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center p-3 bg-amber-50 rounded-md text-amber-800 border border-amber-200">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">
                    Cette action va replacer le virement en statut <strong>"En attente"</strong> et annuler
                    tout traitement précédent.
                  </span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRestoreTransfer}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Restauration...
                  </>
                ) : (
                  "Confirmer la restauration"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

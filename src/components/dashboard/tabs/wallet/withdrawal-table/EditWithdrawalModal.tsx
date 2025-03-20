
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notificationService } from "@/services/notifications";

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  bank_info: {
    accountName: string;
    bankName: string;
    accountNumber: string;
  } | Record<string, any>;
}

interface EditWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: WithdrawalRequest | null;
  onUpdate: () => void;
}

export default function EditWithdrawalModal({ isOpen, onClose, withdrawal, onUpdate }: EditWithdrawalModalProps) {
  const [status, setStatus] = useState<string>("");
  const [processedDate, setProcessedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (withdrawal) {
      setStatus(withdrawal.status || "");
      setProcessedDate(withdrawal.processed_at ? new Date(withdrawal.processed_at) : undefined);
    }
  }, [withdrawal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawal) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: status,
          processed_at: processedDate ? processedDate.toISOString() : null
        })
        .eq('id', withdrawal.id);
      
      if (error) throw error;
      
      // Send notifications based on the status update
      if (status === 'paid') {
        // Notify user that withdrawal has been paid
        await notificationService.withdrawalPaid(withdrawal.amount);
        
        // Create a transaction entry in the wallet_transactions table
        await supabase.from('wallet_transactions').insert({
          user_id: withdrawal.bank_info?.user_id || (await supabase.auth.getUser()).data.user?.id,
          amount: withdrawal.amount,
          type: 'withdrawal',
          description: `Retrait de ${withdrawal.amount}€ payé`,
          status: 'completed'
        });
      } else if (status === 'rejected') {
        // Notify user that withdrawal has been rejected
        await notificationService.withdrawalRejected(withdrawal.amount);
        
        // Create a transaction entry showing the rejection
        await supabase.from('wallet_transactions').insert({
          user_id: withdrawal.bank_info?.user_id || (await supabase.auth.getUser()).data.user?.id,
          amount: withdrawal.amount,
          type: 'withdrawal',
          description: `Retrait de ${withdrawal.amount}€ rejeté`,
          status: 'rejected'
        });
      }
      
      toast.success("Demande de retrait mise à jour avec succès");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la demande de retrait:", error);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "pending", label: "En attente" },
    { value: "paid", label: "Payé" },
    { value: "rejected", label: "Rejeté" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier la demande de retrait</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant</Label>
            <Input 
              id="amount"
              value={`${withdrawal?.amount || 0} €`}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="" disabled>Sélectionner un statut</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {processedDate ? format(processedDate, "P", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={processedDate}
                  onSelect={setProcessedDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

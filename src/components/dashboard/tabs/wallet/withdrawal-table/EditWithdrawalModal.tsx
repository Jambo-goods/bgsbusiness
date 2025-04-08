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
    user_id?: string;
  } | Record<string, any>;
}

interface EditWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: WithdrawalRequest | null;
  onUpdate: () => void;
}

export default function EditWithdrawalModal({ isOpen, onClose, withdrawal, onUpdate }: EditWithdrawalModalProps) {
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomerUser, setIsCustomerUser] = useState(true);

  useEffect(() => {
    // Check if user has admin role
    const checkAdminRole = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (user) {
        const isAdmin = user.app_metadata?.role === 'admin';
        setIsCustomerUser(!isAdmin);
      }
    };

    checkAdminRole();
  }, []);

  useEffect(() => {
    if (withdrawal && withdrawal.bank_info) {
      setBankName(withdrawal.bank_info.bankName || "");
      setAccountName(withdrawal.bank_info.accountName || "");
      setAccountNumber(withdrawal.bank_info.accountNumber || "");
    }
  }, [withdrawal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawal) return;
    
    setIsSubmitting(true);
    
    try {
      // Update the bank information for the withdrawal request
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          bank_info: {
            ...withdrawal.bank_info,
            bankName: bankName,
            accountName: accountName,
            accountNumber: accountNumber
          }
        })
        .eq('id', withdrawal.id);
      
      if (error) throw error;
      
      toast.success("Les informations bancaires ont été mises à jour");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations:", error);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!withdrawal) return;
    
    if (withdrawal.status !== 'pending') {
      toast.error("Seules les demandes en attente peuvent être annulées");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Important: For a pending withdrawal, we should not have touched the user's balance yet
      // So we just need to mark it as cancelled, without needing to refund

      // Update the withdrawal request status to 'cancelled'
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'cancelled' })
        .eq('id', withdrawal.id);
      
      if (error) throw error;
      
      toast.success(`La demande de retrait de ${withdrawal.amount}€ a été annulée`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'annulation de la demande:", error);
      toast.error("Une erreur est survenue lors de l'annulation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier les informations bancaires</DialogTitle>
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
            <Label htmlFor="bankName">Nom de la banque</Label>
            <Input 
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountName">Titulaire du compte</Label>
            <Input 
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Numéro de compte (IBAN)</Label>
            <Input 
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              pattern="^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$"
              title="Format IBAN valide requis (ex: FR7612345678901234567890123)"
            />
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {withdrawal?.status === 'pending' && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleCancel}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Annuler la demande
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Fermer
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

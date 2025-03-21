
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
import { useScheduledPayments } from "@/hooks/useScheduledPayments";
import { toast } from "sonner";

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: {
    id: string;
    project_id: string;
    payment_date: string;
    percentage: number;
    status: string;
    projects?: {
      name: string;
    };
  } | null;
}

export default function EditPaymentModal({ isOpen, onClose, payment }: EditPaymentModalProps) {
  const [percentage, setPercentage] = useState(payment?.percentage || 0);
  const [date, setDate] = useState<Date | undefined>(
    payment?.payment_date ? new Date(payment.payment_date) : undefined
  );
  const [status, setStatus] = useState(payment?.status || "scheduled");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updatePaymentStatus } = useScheduledPayments();

  useEffect(() => {
    if (payment) {
      setPercentage(payment.percentage || 0);
      setDate(payment.payment_date ? new Date(payment.payment_date) : undefined);
      setStatus(payment.status || "scheduled");
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment || !date) return;
    
    setIsSubmitting(true);
    
    try {
      await updatePaymentStatus(
        payment.id, 
        status as 'pending' | 'scheduled' | 'paid',
        date.toISOString(),
        percentage
      );
      
      toast.success("Paiement programmé mis à jour avec succès");
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le paiement programmé</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project">Projet</Label>
            <Input 
              id="project"
              value={payment.projects?.name || "Projet inconnu"}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="percentage">Pourcentage (%)</Label>
            <Input 
              id="percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(parseFloat(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date de paiement</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "P", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="scheduled">Programmé</option>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
            </select>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !date}>
              {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

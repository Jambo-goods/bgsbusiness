
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
import { supabase } from "@/integrations/supabase/client";

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
  
  const { updatePaymentStatus, scheduledPayments, refetch } = useScheduledPayments();

  useEffect(() => {
    if (payment) {
      setPercentage(payment.percentage || 0);
      setDate(payment.payment_date ? new Date(payment.payment_date) : undefined);
      setStatus(payment.status || "scheduled");
    }
  }, [payment, isOpen]);

  useEffect(() => {
    if (isOpen && payment) {
      refetch();
    }
  }, [isOpen, payment, refetch]);

  const processPayment = async (paymentId: string, projectId: string, paymentPercentage: number) => {
    console.log(`Démarrage du traitement du paiement ${paymentId} pour le projet ${projectId}`);
    
    try {
      const { data: result, error } = await supabase.functions.invoke(
        'update-wallet-on-payment',
        {
          body: {
            paymentId: paymentId,
            projectId: projectId,
            percentage: paymentPercentage,
            processAll: true,
            forceRefresh: true
          }
        }
      );
      
      if (error) {
        console.error(`Erreur lors du traitement du paiement ${paymentId}:`, error);
        throw new Error(error.message);
      }
      
      console.log(`Paiement ${paymentId} traité avec succès:`, result);
      return result;
    } catch (err) {
      console.error(`Erreur lors de l'appel de la fonction edge:`, err);
      throw err;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payment || !date) return;
    
    setIsSubmitting(true);
    
    try {
      await refetch();
      
      const switchingToPaid = status === 'paid' && payment.status !== 'paid';
      
      // Mise à jour directe dans la base de données pour un effet immédiat
      if (switchingToPaid || status !== payment.status) {
        console.log(`Mise à jour directe du statut du paiement ${payment.id} vers ${status}`);
        const { error: directUpdateError } = await supabase
          .from('scheduled_payments')
          .update({
            status: status,
            payment_date: date.toISOString(),
            percentage: percentage,
            updated_at: new Date().toISOString(),
            processed_at: switchingToPaid ? null : undefined // Reset processed_at when switching to paid
          })
          .eq('id', payment.id);
          
        if (directUpdateError) {
          console.error("Erreur lors de la mise à jour directe:", directUpdateError);
          throw new Error(directUpdateError.message);
        }
        
        // Force une actualisation des données
        await refetch();
      }
      
      // Mets à jour via le hook après la mise à jour directe
      await updatePaymentStatus(
        payment.id, 
        status as 'pending' | 'scheduled' | 'paid',
        date.toISOString(),
        percentage
      );
      
      // Si on passe à payé, traite les portefeuilles des investisseurs
      if (switchingToPaid) {
        toast.success("Paiement marqué comme payé", {
          description: "Traitement des rendements pour les investisseurs en cours..."
        });
        
        try {
          // Traite directement le paiement via la fonction edge
          const result = await processPayment(payment.id, payment.project_id, percentage);
          
          if (result?.processed > 0) {
            toast.success("Paiement traité avec succès", {
              description: `${result.processed} investisseur(s) ont reçu leur rendement`
            });
            
            // Vérifie que le paiement est bien marqué comme traité
            const { data: updatedPayment } = await supabase
              .from('scheduled_payments')
              .select('processed_at')
              .eq('id', payment.id)
              .single();
              
            if (!updatedPayment?.processed_at) {
              console.log("Le paiement n'est pas marqué comme traité, mise à jour manuelle...");
              await supabase
                .from('scheduled_payments')
                .update({ 
                  processed_at: new Date().toISOString(),
                  status: 'paid'
                })
                .eq('id', payment.id);
            }
          } else {
            toast.info("Aucun investisseur à créditer pour ce paiement");
          }
        } catch (err) {
          console.error(`Erreur lors du traitement du paiement:`, err);
          toast.error("Erreur lors de la mise à jour des soldes des investisseurs");
        }
      } else {
        toast.success("Paiement programmé mis à jour avec succès");
      }
      
      // Force une actualisation additionnelle pour s'assurer que l'UI est à jour
      await refetch();
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

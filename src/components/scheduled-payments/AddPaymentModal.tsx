
import React, { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPaymentModal({ isOpen, onClose }: AddPaymentModalProps) {
  const [projectId, setProjectId] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState("scheduled");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { addScheduledPayment } = useScheduledPayments();

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name')
          .eq('status', 'active');
          
        if (error) throw error;
        
        setProjects(data || []);
        if (data && data.length > 0) {
          setProjectId(data[0].id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        toast.error("Impossible de charger la liste des projets");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId || !date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addScheduledPayment({
        project_id: projectId,
        payment_date: date.toISOString(),
        percentage: percentage,
        status: status as 'pending' | 'scheduled' | 'paid',
        total_scheduled_amount: 0, // Ces valeurs seront calculées par le backend
        investors_count: 0,
        processed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      toast.success("Nouveau paiement programmé créé avec succès");
      onClose();
      
      // Reset form
      setProjectId("");
      setPercentage(0);
      setDate(undefined);
      setStatus("scheduled");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Une erreur est survenue lors de la création du paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau paiement programmé</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project">Projet</Label>
            {isLoading ? (
              <div className="py-2">Chargement des projets...</div>
            ) : (
              <select
                id="project"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                {projects.length === 0 ? (
                  <option value="">Aucun projet disponible</option>
                ) : (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                )}
              </select>
            )}
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
            <Button 
              type="submit" 
              disabled={isSubmitting || !date || !projectId || isLoading}
            >
              {isSubmitting ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

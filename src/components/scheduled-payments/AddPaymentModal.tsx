
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: any) => void;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'scheduled', label: 'Programmé' },
  { value: 'paid', label: 'Payé' }
];

const AddPaymentModal = ({ isOpen, onClose, onAddPayment }: AddPaymentModalProps) => {
  // Form state
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [percentage, setPercentage] = useState<string>('');
  const [status, setStatus] = useState<string>('pending');
  
  // UI state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [openDateSelect, setOpenDateSelect] = useState(false);

  // Fetch projects from the database
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, status')
          .order('name');
          
        if (error) {
          console.error('Error fetching projects:', error);
          toast.error('Erreur lors de la récupération des projets');
          return;
        }
        
        console.log('Projets récupérés:', data);
        setProjects(data || []);
      } catch (error) {
        console.error('Error in fetchProjects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    fetchProjects();
  }, [isOpen]);

  const resetForm = () => {
    setSelectedProject(null);
    setProjectName('');
    setSelectedDate(new Date());
    setPercentage('');
    setStatus('pending');
    setOpenDateSelect(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      console.log('Projet sélectionné:', project);
      setSelectedProject(projectId);
      setProjectName(project.name);
    }
  };

  const handleAddPayment = () => {
    if (!selectedProject) {
      toast.error('Veuillez sélectionner un projet');
      return;
    }

    if (!selectedDate) {
      toast.error('Veuillez sélectionner une date de paiement');
      return;
    }

    if (!percentage || parseFloat(percentage) <= 0) {
      toast.error('Veuillez entrer un pourcentage valide');
      return;
    }

    // Since we no longer collect total_invested_amount, we'll set it to 0
    // The scheduled amount will also be 0 since it depends on total investment
    const paymentData = {
      project_id: selectedProject,
      payment_date: selectedDate?.toISOString() || new Date().toISOString(),
      status: status,
      percentage: parseFloat(percentage) || 0,
      total_invested_amount: 0,
      total_scheduled_amount: 0,
      investors_count: 0,
      notes: ''
    };

    onAddPayment(paymentData);
    handleModalClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un paiement planifié</DialogTitle>
          <DialogDescription>
            Entrez les détails du paiement planifié pour un projet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Project Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Projet
            </Label>
            <div className="col-span-3">
              {isLoadingProjects ? (
                <div className="w-full h-10 flex items-center justify-center border rounded-md border-input bg-background">
                  <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                </div>
              ) : (
                <Select value={selectedProject || ""} onValueChange={handleProjectSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un projet" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date de paiement
            </Label>
            <div className="col-span-3">
              <Popover open={openDateSelect} onOpenChange={setOpenDateSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                    onClick={() => setOpenDateSelect(true)}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setOpenDateSelect(false);
                    }}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Percentage Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="percentage" className="text-right">
              Pourcentage
            </Label>
            <Input
              type="number"
              id="percentage"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="col-span-3"
              placeholder="ex: 5.0 pour 5%"
              step="0.01"
              min="0"
            />
          </div>

          {/* Status Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Statut
            </Label>
            <div className="col-span-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Dialog Footer */}
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={handleModalClose}>
            Annuler
          </Button>
          <Button type="submit" onClick={handleAddPayment}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentModal;

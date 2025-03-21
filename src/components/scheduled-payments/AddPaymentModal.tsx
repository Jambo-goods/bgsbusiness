
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { toast } from 'sonner';
import { fr } from 'date-fns/locale';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: any) => void;
}

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'scheduled', label: 'Programmé' },
  { value: 'paid', label: 'Payé' }
];

const AddPaymentModal = ({ isOpen, onClose, onAddPayment }: AddPaymentModalProps) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [percentage, setPercentage] = useState<string>('');
  const [status, setStatus] = useState<string>('pending');
  const [totalInvestment, setTotalInvestment] = useState('');
  const [scheduledAmount, setScheduledAmount] = useState('');
  const [investorsCount, setInvestorsCount] = useState('');
  const [cumulativeAmount, setCumulativeAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  // Gestion séparée des états d'ouverture pour les sélecteurs
  const [openProjectSelect, setOpenProjectSelect] = useState(false);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [openDateSelect, setOpenDateSelect] = useState(false);

  // Fetch projects from the database
  useEffect(() => {
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
        
        setProjects(data || []);
      } catch (error) {
        console.error('Error in fetchProjects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  // Calculate scheduled amount based on percentage and total investment
  useEffect(() => {
    if (totalInvestment && percentage) {
      const calculatedAmount = (parseFloat(totalInvestment) * parseFloat(percentage)) / 100;
      setScheduledAmount(calculatedAmount.toString());
    }
  }, [totalInvestment, percentage]);

  const handleProjectSelect = (projectId: string) => {
    const selected = projects.find(p => p.id === projectId);
    if (selected) {
      setSelectedProject(projectId);
      setProjectName(selected.name || '');
    }
    // Attendre avant de fermer le Popover pour éviter les problèmes de state
    setTimeout(() => {
      setOpenProjectSelect(false);
    }, 100);
  };

  const handleStatusSelect = (statusValue: string) => {
    setStatus(statusValue);
    // Attendre avant de fermer le Popover pour éviter les problèmes de state
    setTimeout(() => {
      setOpenStatusSelect(false);
    }, 100);
  };

  const resetForm = () => {
    setSelectedProject(null);
    setProjectName('');
    setSelectedDate(new Date());
    setPercentage('');
    setStatus('pending');
    setTotalInvestment('');
    setScheduledAmount('');
    setInvestorsCount('');
    setCumulativeAmount('');
    setNotes('');
    setOpenProjectSelect(false);
    setOpenStatusSelect(false);
    setOpenDateSelect(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
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

    const paymentData = {
      project_id: selectedProject,
      payment_date: selectedDate?.toISOString() || new Date().toISOString(),
      status: status,
      percentage: parseFloat(percentage) || 0,
      total_invested_amount: parseInt(totalInvestment) || 0,
      total_scheduled_amount: parseInt(scheduledAmount) || 0,
      investors_count: parseInt(investorsCount) || 0,
      notes: notes || ''
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Projet
            </Label>
            <div className="col-span-3">
              <Popover 
                open={openProjectSelect} 
                onOpenChange={setOpenProjectSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProjectSelect}
                    className="w-full justify-between"
                  >
                    {isLoadingProjects ? "Chargement des projets..." : (projectName || "Sélectionner un projet")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  {projects.length > 0 ? (
                    <Command>
                      <CommandInput placeholder="Rechercher un projet..." />
                      <CommandEmpty>Aucun projet trouvé</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-y-auto">
                        {projects.map((project) => (
                          <CommandItem
                            key={project.id}
                            value={project.id}
                            onSelect={handleProjectSelect}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProject === project.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {project.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  ) : (
                    <div className="p-2 text-sm text-center">
                      {isLoadingProjects ? "Chargement..." : "Aucun projet disponible"}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
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
                      setTimeout(() => setOpenDateSelect(false), 100);
                    }}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Statut
            </Label>
            <div className="col-span-3">
              <Popover open={openStatusSelect} onOpenChange={setOpenStatusSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStatusSelect}
                    className="w-full justify-between"
                  >
                    {statusOptions.find(s => s.value === status)?.label || "Sélectionner un statut"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandGroup>
                      {statusOptions.map((statusOption) => (
                        <CommandItem
                          key={statusOption.value}
                          value={statusOption.value}
                          onSelect={handleStatusSelect}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              status === statusOption.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {statusOption.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalInvestment" className="text-right">
              Investissement total
            </Label>
            <Input
              type="number"
              id="totalInvestment"
              value={totalInvestment}
              onChange={(e) => setTotalInvestment(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scheduledAmount" className="text-right">
              Montant planifié
            </Label>
            <Input
              type="number"
              id="scheduledAmount"
              value={scheduledAmount}
              onChange={(e) => setScheduledAmount(e.target.value)}
              className="col-span-3"
              readOnly={percentage !== '' && totalInvestment !== ''}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="investorsCount" className="text-right">
              Nombre d'investisseurs
            </Label>
            <Input
              type="number"
              id="investorsCount"
              value={investorsCount}
              onChange={(e) => setInvestorsCount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Input 
              id="notes" 
              value={notes} 
              className="col-span-3" 
              onChange={(e) => setNotes(e.target.value)} 
            />
          </div>
        </div>
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

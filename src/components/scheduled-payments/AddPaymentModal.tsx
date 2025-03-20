import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: any) => void;
}

const AddPaymentModal = ({ isOpen, onClose, onAddPayment }: AddPaymentModalProps) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [totalInvestment, setTotalInvestment] = useState('');
  const [scheduledAmount, setScheduledAmount] = useState('');
  const [investorsCount, setInvestorsCount] = useState('');
  const [cumulativeAmount, setCumulativeAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddPayment = () => {
    // Remove the created_at field from the payment object
    const paymentData = {
      project_id: selectedProject || '',
      payment_date: selectedDate?.toISOString() || new Date().toISOString(),
      total_invested_amount: parseInt(totalInvestment) || 0,
      total_scheduled_amount: parseInt(scheduledAmount) || 0,
      investors_count: parseInt(investorsCount) || 0,
      cumulative_amount: parseInt(cumulativeAmount) || 0,
      is_paid: false,
      payment_method: 'bank_transfer',
      notes: notes || ''
    };

    onAddPayment(paymentData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <Input id="project" value={selectedProject || 'N/A'} className="col-span-3" onChange={(e) => setSelectedProject(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date de paiement
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
            <Label htmlFor="cumulativeAmount" className="text-right">
              Montant cumulé
            </Label>
            <Input
              type="number"
              id="cumulativeAmount"
              value={cumulativeAmount}
              onChange={(e) => setCumulativeAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Input id="notes" value={notes} className="col-span-3" onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
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

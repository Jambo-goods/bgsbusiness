
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogFooter } from "@/components/ui/dialog";

interface PaymentEditFormProps {
  payment: {
    id: string;
    project_id: string;
    payment_date: string;
    percentage: number;
    status: string;
    projects?: {
      name: string;
    };
  };
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
  percentage: number;
  setPercentage: (value: number) => void;
  date: Date | undefined;
  setDate: (value: Date | undefined) => void;
  status: string;
  setStatus: (value: string) => void;
}

export default function PaymentEditForm({
  payment,
  onSubmit,
  onClose,
  isSubmitting,
  percentage,
  setPercentage,
  date,
  setDate,
  status,
  setStatus
}: PaymentEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
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
  );
}

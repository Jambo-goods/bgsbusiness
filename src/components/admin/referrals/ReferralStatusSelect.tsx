
import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface ReferralStatusSelectProps {
  referralId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const ReferralStatusSelect: React.FC<ReferralStatusSelectProps> = ({ 
  referralId, 
  currentStatus,
  onStatusChange
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'active', label: 'Actif' },
    { value: 'completed', label: 'Complété' },
    { value: 'cancelled', label: 'Annulé' }
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('referrals')
        .update({ status: newStatus })
        .eq('id', referralId);
      
      if (error) throw error;
      
      onStatusChange(newStatus);
      toast.success('Statut mis à jour avec succès');
    } catch (err) {
      console.error('Error updating referral status:', err);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sélectionner un statut" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {currentStatus === option.value && <Check className="h-4 w-4" />}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ReferralStatusSelect;

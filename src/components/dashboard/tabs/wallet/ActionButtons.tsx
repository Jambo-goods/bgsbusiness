
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  refreshBalance?: () => Promise<void>;
}

export default function ActionButtons({
  onDeposit,
  onWithdraw,
  refreshBalance
}: ActionButtonsProps) {
  const handleRefresh = async () => {
    if (refreshBalance) {
      try {
        await refreshBalance();
        toast.info("Actualisation des données...");
      } catch (error) {
        console.error("Erreur lors de l'actualisation:", error);
        toast.error("Erreur lors de l'actualisation des données");
      }
    }
  };
  
  return (
    <div className="flex items-center gap-2 mt-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 border-bgs-blue text-bgs-blue hover:bg-bgs-blue/10"
        onClick={onDeposit}
      >
        Voir les instructions de virement
      </Button>
      
      <Button 
        onClick={onWithdraw} 
        variant="outline" 
        className="flex items-center gap-2"
      >
        Demander un retrait
      </Button>
      
      <Button
        onClick={handleRefresh}
        variant="ghost"
        size="icon"
        className="ml-auto"
        title="Actualiser le solde"
      >
        <RotateCw className="w-4 h-4" />
      </Button>
    </div>
  );
}

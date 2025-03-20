
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUser } from "@/hooks/dashboard/useUserSession";

export interface ActionButtonsProps {
  onDeposit: () => Promise<void>;
  onWithdraw: () => Promise<void>;
  refreshBalance: (showLoading?: boolean) => Promise<void>;
}

export default function ActionButtons({ 
  onDeposit, 
  onWithdraw, 
  refreshBalance 
}: ActionButtonsProps) {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleDepositClick = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour effectuer un dépôt");
      return;
    }
    
    try {
      await onDeposit();
    } catch (error) {
      console.error("Error handling deposit:", error);
      toast.error("Une erreur est survenue lors de la préparation du dépôt");
    }
  };

  const handleWithdrawClick = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour effectuer un retrait");
      return;
    }
    
    try {
      await onWithdraw();
    } catch (error) {
      console.error("Error handling withdraw:", error);
      toast.error("Une erreur est survenue lors de la préparation du retrait");
    }
  };

  return (
    <div className="flex gap-3">
      <Button 
        onClick={handleDepositClick}
        className="flex items-center gap-2 bg-bgs-blue text-white hover:bg-bgs-blue-dark"
      >
        <Plus className="w-4 h-4" />
        Déposer des fonds
      </Button>
      <Button 
        onClick={handleWithdrawClick}
        variant="outline" 
        className="flex items-center gap-2"
      >
        <ArrowUpRight className="w-4 h-4" />
        Retirer des fonds
      </Button>
    </div>
  );
}


import React from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Project } from "@/types/project";
import { useInvestmentActions } from "@/hooks/useInvestmentActions";

interface InvestButtonProps {
  project: Project;
  isLoggedIn: boolean;
  walletBalance: number;
  selectedAmount: number;
  selectedDuration: number;
  minInvestment: number;
  expectedYield: number;
  isInvesting: boolean;
  setIsInvesting: (value: boolean) => void;
  onInvestmentConfirmed: () => void;
}

export default function InvestButton({
  project,
  isLoggedIn,
  walletBalance,
  selectedAmount,
  selectedDuration,
  minInvestment,
  expectedYield,
  isInvesting,
  setIsInvesting,
  onInvestmentConfirmed
}: InvestButtonProps) {
  const navigate = useNavigate();
  const { handleInvestment } = useInvestmentActions();
  
  const handleInvest = async () => {
    if (selectedAmount < minInvestment) {
      toast.error(`L'investissement minimum est de ${minInvestment}€`);
      return;
    }

    if (!isLoggedIn) {
      localStorage.setItem("investmentIntent", JSON.stringify({
        projectId: project.id,
        amount: selectedAmount,
        duration: selectedDuration,
        yield: expectedYield,
        projectName: project.name
      }));
      navigate("/login");
      return;
    }

    if (walletBalance < selectedAmount) {
      const amountNeeded = selectedAmount - walletBalance;
      toast.error(
        <div>
          <p className="font-semibold">Solde insuffisant</p>
          <p>Vous avez besoin de {amountNeeded}€ supplémentaires pour investir {selectedAmount}€</p>
        </div>,
        {
          duration: 5000,
          action: {
            label: "Effectuer un dépôt",
            onClick: () => navigate("/dashboard/wallet?action=deposit")
          }
        }
      );
      
      // Redirection automatique après 3 secondes
      setTimeout(() => {
        navigate("/dashboard/wallet?action=deposit");
      }, 3000);
      return;
    }

    handleInvestment({
      project,
      selectedAmount,
      selectedDuration,
      expectedYield,
      setIsInvesting,
      onSuccess: onInvestmentConfirmed
    });
  };
  
  return (
    <Button 
      className="w-full relative overflow-hidden group bg-gradient-to-r from-bgs-blue to-bgs-blue-light hover:shadow-lg transition-all duration-300 border-none" 
      size="lg" 
      onClick={handleInvest} 
      disabled={isInvesting || selectedAmount < minInvestment || isLoggedIn && walletBalance < selectedAmount}
    >
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-bgs-blue-light to-bgs-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="relative flex items-center justify-center font-medium">
        {isInvesting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Traitement en cours...
          </span>
        ) : (
          <span className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Investir maintenant
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        )}
      </span>
    </Button>
  );
}

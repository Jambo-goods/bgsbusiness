<lov-codelov-code>
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, TrendingUp, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InvestmentOptionsSectionProps {
  project: Project;
  selectedAmount: number;
  selectedDuration: number;
  minInvestment: number;
  expectedYield: number;
  onInvestmentConfirmed: () => void;
}

export default function InvestmentOptionsSection({
  project,
  selectedAmount,
  selectedDuration,
  minInvestment,
  expectedYield,
  onInvestmentConfirmed
}: InvestmentOptionsSectionProps) {
  const navigate = useNavigate();
  const [isInvesting, setIsInvesting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const checkUserSession = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);

        const {
          data,
          error
        } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
        if (error) {
          console.error("Erreur lors de la récupération du solde:", error);
        } else if (data) {
          setWalletBalance(data.wallet_balance ?? 0);

          if (data.wallet_balance === null || data.wallet_balance === undefined) {
            const {
              error: updateError
            } = await supabase.from('profiles').update({
              wallet_balance: 0
            }).eq('id', user.id);
            if (updateError) {
              console.error("Erreur lors de l'initialisation du solde:", updateError);
            }
          }
        }
      }
    };
    checkUserSession();

    const profileChannel = supabase.channel('profile-changes-invest').on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles'
    }, payload => {
      const newBalance = payload.new.wallet_balance;
      if (newBalance !== undefined) {
        setWalletBalance(newBalance);
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, []);

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

    // Store the investment details in localStorage for the confirmation page
    localStorage.setItem("pendingInvestment", JSON.stringify({
      projectId: project.id,
      projectName: project.name,
      amount: selectedAmount,
      duration: selectedDuration,
      yield: expectedYield,
      timestamp: new Date().toISOString()
    }));
    
    // Set investing state and redirect to confirmation page
    setIsInvesting(true);
    
    // Use explicit path construction with project ID to ensure correct navigation
    const confirmationPath = `/project/${project.id}/confirmation`;
    console.log("Redirecting to:", confirmationPath);
    
    try {
      // Immediate navigation to ensure it happens
      navigate(confirmationPath, { replace: false });
    } catch (error) {
      console.error("Erreur de redirection:", error);
      toast.error("Erreur lors de la redirection vers la page de confirmation");
      setIsInvesting(false);
    }
  };

  return <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Votre investissement</h3>
      
      {selectedAmount < minInvestment && <div className="flex items-start gap-2 text-amber-600 mb-4 p-3 bg-amber-50 rounded-md">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            L'investissement minimum pour ce projet est de {minInvestment}€.
          </p>
        </div>}
      
      {isLoggedIn && walletBalance < selectedAmount && (
        <div className="flex items-start gap-2 text-red-600 mb-4 p-3 bg-red-50 rounded-md">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Solde insuffisant pour investir</p>
            <p className="mt-1">Vous avez actuellement {walletBalance}€ dans votre portefeuille.</p>
            <p className="mt-1 font-medium">Montant manquant: {selectedAmount - walletBalance}€</p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-red-600 hover:text-red-800 mt-2 flex items-center gap-1.5" 
              onClick={() => navigate("/dashboard/wallet?action=deposit")}
            >
              <Wallet className="h-4 w-4" />
              Effectuer un dépôt maintenant
            </Button>
          </div>
        </div>
      )}
      
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
      
      {!isLoggedIn}
    </div>;
}
</lov-code>

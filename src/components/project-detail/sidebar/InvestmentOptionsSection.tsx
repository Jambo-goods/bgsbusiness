
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
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
  
  // Vérifier si l'utilisateur est connecté et récupérer son solde de portefeuille
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsLoggedIn(true);
        
        // Récupérer le solde du portefeuille
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error("Erreur lors de la récupération du solde:", error);
        } else if (data) {
          setWalletBalance(data.wallet_balance || 0);
        }
      }
    };
    
    checkUserSession();
  }, []);

  const handleInvest = async () => {
    // Vérifier que le montant est valide
    if (selectedAmount < minInvestment) {
      toast.error(`L'investissement minimum est de ${minInvestment}€`);
      return;
    }
    
    // Si non connecté, rediriger vers la connexion
    if (!isLoggedIn) {
      // Stocker l'intention d'investissement dans localStorage
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
    
    // Vérifier que l'utilisateur a assez d'argent dans son portefeuille
    if (walletBalance < selectedAmount) {
      toast.error(`Solde insuffisant. Vous avez ${walletBalance}€ et vous essayez d'investir ${selectedAmount}€.`);
      return;
    }
    
    // Commencer le processus d'investissement
    setIsInvesting(true);
    
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        return;
      }
      
      // Calculer la date de fin (durée en mois à partir de maintenant)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + selectedDuration);
      
      // Créer l'investissement
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: project.id,
          amount: selectedAmount,
          yield_rate: expectedYield,
          duration: selectedDuration,
          end_date: endDate.toISOString()
        });
      
      if (investmentError) {
        console.error("Erreur lors de la création de l'investissement:", investmentError);
        toast.error("Impossible de créer l'investissement");
        return;
      }
      
      // Créer une transaction pour retirer le montant du portefeuille
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          amount: -selectedAmount,
          type: 'investment',
          description: `Investissement dans ${project.name}`
        });
      
      if (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError);
        toast.error("Impossible de créer la transaction");
        return;
      }
      
      // Mettre à jour le solde du portefeuille
      const { error: balanceError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: user.id, increment_amount: -selectedAmount }
      );
      
      if (balanceError) {
        console.error("Erreur lors de la mise à jour du solde:", balanceError);
        toast.error("Impossible de mettre à jour votre solde");
        return;
      }
      
      // Mettre à jour les statistiques de l'utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count')
        .eq('id', user.id)
        .single();
      
      if (!profileError && profileData) {
        // Vérifier si l'utilisateur a déjà investi dans ce projet
        const { data: existingInvestments } = await supabase
          .from('investments')
          .select('id')
          .eq('user_id', user.id)
          .eq('project_id', project.id);
        
        // Calculer les nouvelles valeurs
        const newTotal = (profileData.investment_total || 0) + selectedAmount;
        let newCount = profileData.projects_count || 0;
        
        if (existingInvestments && existingInvestments.length <= 1) {
          // Incrémenter uniquement si c'est le premier investissement de l'utilisateur dans ce projet
          newCount += 1;
        }
        
        // Mettre à jour le profil
        await supabase
          .from('profiles')
          .update({
            investment_total: newTotal,
            projects_count: newCount
          })
          .eq('id', user.id);
      }
      
      // Stocker l'investissement récent dans localStorage pour l'affichage sur le tableau de bord
      localStorage.setItem("recentInvestment", JSON.stringify({
        projectId: project.id,
        amount: selectedAmount,
        duration: selectedDuration,
        yield: expectedYield,
        projectName: project.name
      }));
      
      // Afficher un message de succès
      toast.success("Investissement réalisé avec succès !");
      
      // Appeler la fonction de confirmation pour mettre à jour l'interface
      onInvestmentConfirmed();
      
      // Rediriger vers le tableau de bord après 2 secondes
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (error) {
      console.error("Erreur lors de l'investissement:", error);
      toast.error("Une erreur est survenue lors de l'investissement");
    } finally {
      setIsInvesting(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Votre investissement</h3>
      
      {selectedAmount < minInvestment && (
        <div className="flex items-start gap-2 text-amber-600 mb-4 p-3 bg-amber-50 rounded-md">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            L'investissement minimum pour ce projet est de {minInvestment}€.
          </p>
        </div>
      )}
      
      {isLoggedIn && walletBalance < selectedAmount && (
        <div className="flex items-start gap-2 text-red-600 mb-4 p-3 bg-red-50 rounded-md">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            Solde insuffisant. Vous avez {walletBalance}€ dans votre portefeuille.
            <br />
            <Button 
              variant="link" 
              className="p-0 h-auto text-red-600 underline" 
              onClick={() => navigate("/dashboard/wallet")}
            >
              Ajoutez des fonds
            </Button>
          </p>
        </div>
      )}
      
      <Button 
        className="w-full bg-bgs-blue hover:bg-bgs-blue-dark" 
        size="lg"
        onClick={handleInvest}
        disabled={isInvesting || selectedAmount < minInvestment || (isLoggedIn && walletBalance < selectedAmount)}
      >
        {isInvesting ? "Traitement en cours..." : "Investir maintenant"} 
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      
      {!isLoggedIn && (
        <p className="text-xs text-bgs-gray-medium mt-2 text-center">
          Vous serez redirigé vers la page de connexion
        </p>
      )}
    </div>
  );
}

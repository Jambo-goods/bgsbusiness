
import React, { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { Slider } from "@/components/ui/slider";
import { Check, AlertCircle, Calculator, Calendar, TrendingUp, Factory, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProjectInvestmentSimulatorProps {
  project: Project;
}

export default function ProjectInvestmentSimulator({ project }: ProjectInvestmentSimulatorProps) {
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState<number>(project.minInvestment);
  const [duration, setDuration] = useState<number>(
    project.possibleDurations ? project.possibleDurations[0] : 12
  );
  const [totalReturn, setTotalReturn] = useState<number>(0);
  const [monthlyReturn, setMonthlyReturn] = useState<number>(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  
  // Vérifier si l'utilisateur est connecté et récupérer son solde
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
          // Utiliser l'opérateur nullish coalescing pour garantir que la valeur est 0 si null ou undefined
          setWalletBalance(data.wallet_balance ?? 0);
        }
      }
    };
    
    checkUserSession();
  }, []);
  
  // Calculer les rendements lorsque les entrées changent
  useEffect(() => {
    // Calculer le rendement mensuel (en euros)
    const calculatedMonthlyReturn = investmentAmount * (project.yield / 100);
    
    // Calculer le rendement total sur la durée complète (capital + intérêts)
    const calculatedTotalReturn = investmentAmount + (calculatedMonthlyReturn * duration);
    
    setTotalReturn(calculatedTotalReturn);
    setMonthlyReturn(calculatedMonthlyReturn);
  }, [investmentAmount, duration, project.yield]);
  
  // Calculer le rendement annuel (pour l'affichage)
  const annualYieldPercentage = project.yield * 12;
  
  const handleInvest = async () => {
    // Si non connecté, rediriger vers la connexion
    if (!isLoggedIn) {
      // Stocker l'intention d'investissement dans localStorage
      localStorage.setItem("investmentIntent", JSON.stringify({
        projectId: project.id,
        amount: investmentAmount,
        duration: duration,
        yield: project.yield,
        projectName: project.name
      }));
      
      navigate("/login");
      return;
    }
    
    // Vérifier que l'utilisateur a assez d'argent dans son portefeuille
    if (walletBalance < investmentAmount) {
      toast.error(`Solde insuffisant. Vous avez ${walletBalance}€ et vous essayez d'investir ${investmentAmount}€.`, {
        action: {
          label: "Ajouter des fonds",
          onClick: () => navigate("/dashboard/wallet")
        }
      });
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
      endDate.setMonth(endDate.getMonth() + duration);
      
      // Créer l'investissement
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: project.id,
          amount: investmentAmount,
          yield_rate: project.yield,
          duration: duration,
          end_date: endDate.toISOString(),
          date: new Date().toISOString()
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
          amount: -investmentAmount,
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
        { user_id: user.id, increment_amount: -investmentAmount }
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
        const newTotal = (profileData.investment_total || 0) + investmentAmount;
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
        amount: investmentAmount,
        duration: duration,
        yield: project.yield,
        projectName: project.name,
        timestamp: new Date().toISOString()
      }));
      
      // Afficher un message de succès
      toast.success("Investissement réalisé avec succès !");
      
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
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4 flex items-center">
        <Calculator className="mr-2 h-5 w-5 text-bgs-orange" />
        Simulateur d'investissement
      </h2>
      
      {/* Informations du projet */}
      <div className="bg-bgs-gray-light p-4 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <Factory className="h-4 w-4 mr-2 text-bgs-blue/60" />
            <div>
              <p className="text-xs text-bgs-blue/70">Entreprise</p>
              <p className="text-sm font-medium text-bgs-blue">{project.companyName}</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-bgs-blue/60" />
            <div>
              <p className="text-xs text-bgs-blue/70">Localisation</p>
              <p className="text-sm font-medium text-bgs-blue">{project.location}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-bgs-blue">Montant à investir</label>
          <span className="text-sm font-bold text-bgs-blue">{investmentAmount.toLocaleString()} €</span>
        </div>
        <Slider
          value={[investmentAmount]}
          min={project.minInvestment}
          max={Math.min(project.price, 20000)}
          step={100}
          onValueChange={(value) => setInvestmentAmount(value[0])}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-bgs-blue/60">
          <span>Min: {project.minInvestment} €</span>
          <span>Max: {Math.min(project.price, 20000).toLocaleString()} €</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-bgs-blue">Durée d'investissement</label>
          <span className="text-sm font-bold text-bgs-blue">{duration} mois</span>
        </div>
        {project.possibleDurations && (
          <div className="flex justify-between gap-2 mb-2">
            {project.possibleDurations.map((months) => (
              <button
                key={months}
                onClick={() => setDuration(months)}
                className={`flex-1 py-2 px-1 text-sm rounded-md transition-colors ${
                  duration === months
                    ? "bg-bgs-blue text-white"
                    : "bg-gray-100 text-bgs-blue hover:bg-gray-200"
                }`}
              >
                {months} mois
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-bgs-gray-light p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-bgs-blue mb-3">Simulation de rendement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Rendement mensuel</p>
            <div className="flex items-center text-green-600 font-bold">
              <TrendingUp className="h-4 w-4 mr-1" />
              {project.yield}% par mois
            </div>
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Rendement annuel</p>
            <div className="flex items-center text-green-600 font-bold">
              <TrendingUp className="h-4 w-4 mr-1" />
              {annualYieldPercentage}% par an
            </div>
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Retour total estimé</p>
            <p className="text-bgs-blue font-bold">{totalReturn.toLocaleString(undefined, {maximumFractionDigits: 2})} €</p>
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Retour mensuel estimé</p>
            <p className="text-bgs-blue font-bold">{monthlyReturn.toLocaleString(undefined, {maximumFractionDigits: 2})} €</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-xs text-bgs-blue/80">Investissement sécurisé par contrat</p>
        </div>
        <div className="flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-xs text-bgs-blue/80">Paiements mensuels directement sur votre compte</p>
        </div>
        <div className="flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-xs text-bgs-blue/80">Suivi en temps réel de votre investissement</p>
        </div>
      </div>
      
      {isLoggedIn && walletBalance < investmentAmount && (
        <div className="flex items-start gap-2 text-red-600 mb-4 p-3 bg-red-50 rounded-md">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">
            Solde insuffisant. Vous avez {walletBalance}€ dans votre portefeuille.
            <button 
              className="block mt-1 underline text-red-600 hover:text-red-800"
              onClick={() => navigate("/dashboard/wallet")}
            >
              Ajoutez des fonds
            </button>
          </p>
        </div>
      )}
      
      <button
        onClick={handleInvest}
        disabled={isInvesting || (isLoggedIn && walletBalance < investmentAmount)}
        className="w-full bg-bgs-blue text-white py-3 rounded-lg hover:bg-bgs-blue-light transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isInvesting ? "Traitement en cours..." : "Investir maintenant"}
      </button>
      
      {!isLoggedIn && (
        <p className="text-xs text-bgs-gray-medium mt-2 text-center">
          Vous serez redirigé vers la page de connexion
        </p>
      )}
    </div>
  );
}

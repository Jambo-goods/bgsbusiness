
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import InvestmentAmountInput from "./InvestmentAmountInput";
import DurationSelector from "./DurationSelector";
import YieldInfo from "./YieldInfo";
import InvestmentSummary from "./InvestmentSummary";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type InvestmentOptionsProps = {
  project: any;
  minInvestment: number;
  possibleDurations?: number[];
  projectYield: number;
  onInvestSuccess: () => void;
};

export default function InvestmentOptionsSection({
  project,
  minInvestment = 1000,
  possibleDurations = [12, 24, 36, 48],
  projectYield = 13.5,
  onInvestSuccess
}: InvestmentOptionsProps) {
  const [amount, setAmount] = useState(minInvestment);
  const [duration, setDuration] = useState(possibleDurations[0] || 12);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const monthlyYield = projectYield / 12;
  const totalReturn = amount * (1 + (projectYield / 100) * (duration / 12));
  const totalProfit = totalReturn - amount;
  
  const handleAmountChange = (value: number) => {
    if (value < minInvestment) {
      setAmount(minInvestment);
    } else {
      setAmount(value);
    }
  };
  
  const handleInvest = async () => {
    setIsSubmitting(true);
    
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Stocker les détails de l'investissement intention dans localStorage pour redirection après connexion
        localStorage.setItem("pendingInvestment", JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          amount,
          duration,
          yield: projectYield
        }));
        
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter ou créer un compte pour investir",
        });
        
        // Rediriger vers la page de connexion
        navigate("/login");
        return;
      }
      
      // Si l'utilisateur est connecté, procéder à l'investissement
      
      // Calculer la date de fin (aujourd'hui + durée en mois)
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + duration);
      
      // Enregistrer l'investissement dans Supabase
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: project.id,
          amount: amount,
          duration: duration,
          yield_rate: projectYield,
          end_date: endDate.toISOString() // Conversion de Date à string ISO
        });
      
      if (investmentError) {
        throw new Error("Erreur lors de l'enregistrement de l'investissement");
      }
      
      // Mettre à jour le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Erreur lors de la récupération du profil:", profileError);
      } else {
        // Mettre à jour les totaux
        const newTotal = (profileData.investment_total || 0) + amount;
        
        // Vérifier si l'utilisateur a déjà investi dans ce projet
        const { data: existingInvestments } = await supabase
          .from('investments')
          .select('id')
          .eq('user_id', user.id)
          .eq('project_id', project.id);
        
        let newCount = profileData.projects_count || 0;
        if (!existingInvestments || existingInvestments.length <= 1) {
          // Incrémenter uniquement si c'est le premier investissement dans ce projet
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
      
      // Stocker l'investissement dans localStorage pour le tableau de bord
      localStorage.setItem("recentInvestment", JSON.stringify({
        projectId: project.id,
        projectName: project.name,
        amount,
        duration,
        yield: projectYield
      }));
      
      // Afficher le succès
      setShowSuccess(true);
      
      // Informer le composant parent
      onInvestSuccess();
      
      // Rediriger vers le tableau de bord après un délai
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'investissement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'investissement. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <div className="text-center space-y-4">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h3 className="text-xl font-semibold text-bgs-blue">Investissement réussi !</h3>
          <p className="text-sm text-bgs-gray-medium">
            Votre investissement de {amount.toLocaleString()}€ dans {project.name} a été enregistré.
          </p>
          <p className="text-sm text-bgs-gray-medium">
            Vous allez être redirigé vers votre tableau de bord.
          </p>
          <Button 
            onClick={() => navigate("/dashboard")} 
            className="w-full mt-4"
          >
            Aller au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-bgs-blue">Options d'investissement</h3>
      
      <InvestmentAmountInput 
        amount={amount} 
        setAmount={handleAmountChange} 
        minInvestment={minInvestment} 
      />
      
      <Separator />
      
      <DurationSelector 
        duration={duration} 
        setDuration={setDuration} 
        options={possibleDurations} 
      />
      
      <Separator />
      
      <YieldInfo 
        monthlyYield={monthlyYield} 
        annualYield={projectYield} 
      />
      
      <Separator />
      
      <InvestmentSummary 
        amount={amount} 
        totalReturn={totalReturn} 
        totalProfit={totalProfit} 
        duration={duration} 
      />
      
      <Button 
        onClick={handleInvest} 
        disabled={isSubmitting} 
        className="w-full flex items-center justify-center gap-2"
      >
        {isSubmitting ? "Traitement en cours..." : (
          <>
            Investir maintenant
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </div>
  );
}

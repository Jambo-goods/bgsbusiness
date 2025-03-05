
import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Project } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Import our components
import InvestmentAmountSection from "./InvestmentAmountSection";
import DurationSection from "./DurationSection";
import InvestmentSummary from "./InvestmentSummary";
import InvestmentConfirmation from "./InvestmentConfirmation";

interface InvestmentOptionsSectionProps {
  project: Project;
  investorCount: number;
}

export default function InvestmentOptionsSection({
  project,
  investorCount
}: InvestmentOptionsSectionProps) {
  const [investmentAmount, setInvestmentAmount] = useState(500);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(
    project.possibleDurations ? project.possibleDurations[0] : parseInt(project.duration)
  );
  const [totalReturn, setTotalReturn] = useState(0);
  const [monthlyReturn, setMonthlyReturn] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const minInvestment = 100;
  const maxInvestment = 10000;
  
  // Get possible durations from project, or create an array from the project duration
  const durations = project.possibleDurations || 
    [parseInt(project.duration.split(' ')[0])];
  
  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkAuthStatus();
  }, []);
  
  // Calculate returns when investment amount or duration changes
  useEffect(() => {
    // Calculate monthly return
    const calculatedMonthlyReturn = investmentAmount * (project.yield / 100);
    
    // Calculate total return after the full duration
    const calculatedTotalReturn = investmentAmount + (calculatedMonthlyReturn * selectedDuration);
    
    setMonthlyReturn(calculatedMonthlyReturn);
    setTotalReturn(calculatedTotalReturn);
  }, [investmentAmount, selectedDuration, project.yield]);
  
  const handleInvest = () => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour pouvoir investir.",
        variant: "destructive"
      });
      
      // Redirection vers la page de connexion
      navigate("/login");
      return;
    }
    
    setShowConfirmation(true);
  };
  
  const confirmInvestment = async () => {
    setIsProcessing(true);
    
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour pouvoir investir.",
          variant: "destructive"
        });
        
        setIsProcessing(false);
        navigate("/login");
        return;
      }
      
      // Insérer l'investissement dans Supabase
      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          project_id: project.id,
          amount: investmentAmount,
          yield_rate: project.yield,
          duration: selectedDuration,
          end_date: new Date(new Date().setMonth(new Date().getMonth() + selectedDuration))
        });
      
      if (error) {
        console.error("Erreur lors de l'enregistrement de l'investissement:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'enregistrement de votre investissement.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Mettre à jour le profil utilisateur (total investi et nombre de projets)
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
        
        let newCount = profileData.projects_count || 0;
        if (existingInvestments && existingInvestments.length <= 1) {
          // Incrémenter uniquement si c'est le premier investissement dans ce projet
          newCount += 1;
        }
        
        // Mettre à jour le profil
        await supabase
          .from('profiles')
          .update({
            investment_total: (profileData.investment_total || 0) + investmentAmount,
            projects_count: newCount
          })
          .eq('id', user.id);
      }
      
      // Sauvegarder les données d'investissement dans le localStorage pour affichage sur le dashboard
      const investmentData = {
        projectId: project.id,
        projectName: project.name,
        amount: investmentAmount,
        duration: selectedDuration,
        yield: project.yield,
        date: new Date().toISOString(),
        monthlyReturn: monthlyReturn,
        totalReturn: totalReturn
      };
      
      localStorage.setItem("recentInvestment", JSON.stringify(investmentData));
      
      toast({
        title: "Investissement réussi !",
        description: `Vous avez investi ${investmentAmount}€ dans ${project.name} pour une durée de ${selectedDuration} mois.`,
      });
      
      // Rediriger vers le tableau de bord
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Erreur lors de l'investissement:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'investissement.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };
  
  const cancelInvestment = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 transform transition-all duration-300 hover:shadow-lg">
      <h3 className="text-xl font-semibold text-bgs-blue mb-5 flex items-center">
        <span className="bg-bgs-orange/10 text-bgs-orange p-1.5 rounded-lg mr-2">
          <ArrowRight size={16} />
        </span>
        Investir maintenant
      </h3>
      
      {!showConfirmation ? (
        <>
          <div className="mb-6 space-y-4">
            <InvestmentAmountSection 
              investmentAmount={investmentAmount}
              setInvestmentAmount={setInvestmentAmount}
              minInvestment={minInvestment}
              maxInvestment={maxInvestment}
            />
            
            <DurationSection
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              durations={durations}
            />
            
            <InvestmentSummary 
              project={project} 
              selectedDuration={selectedDuration}
              monthlyReturn={monthlyReturn}
              totalReturn={totalReturn}
            />
          </div>
          
          <button 
            onClick={handleInvest} 
            className="w-full btn-primary flex items-center justify-center gap-2 transform transition-all duration-300 hover:scale-[1.02]"
          >
            Investir maintenant
            <ArrowRight size={18} />
          </button>
        </>
      ) : (
        <InvestmentConfirmation
          project={project}
          investmentAmount={investmentAmount}
          selectedDuration={selectedDuration}
          isProcessing={isProcessing}
          onConfirm={confirmInvestment}
          onCancel={cancelInvestment}
          monthlyReturn={monthlyReturn}
          totalReturn={totalReturn}
        />
      )}
    </div>
  );
}


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
  
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
  }, []);
  
  // Get possible durations from project, or create an array from the project duration
  const durations = project.possibleDurations || 
    [parseInt(project.duration.split(' ')[0])];
  
  // Calculate returns when investment amount or duration changes
  useEffect(() => {
    // Calculate monthly return
    const calculatedMonthlyReturn = investmentAmount * (project.yield / 100);
    
    // Calculate total return after the full duration
    const calculatedTotalReturn = investmentAmount + (calculatedMonthlyReturn * selectedDuration);
    
    setMonthlyReturn(calculatedMonthlyReturn);
    setTotalReturn(calculatedTotalReturn);
  }, [investmentAmount, selectedDuration, project.yield]);
  
  const handleInvest = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour investir. Redirection vers la page de connexion...",
      });
      
      // Save intended investment to localStorage
      localStorage.setItem("pendingInvestment", JSON.stringify({
        projectId: project.id,
        amount: investmentAmount,
        duration: selectedDuration
      }));
      
      navigate("/login");
      return;
    }
    
    setShowConfirmation(true);
  };
  
  const confirmInvestment = async () => {
    setIsProcessing(true);
    
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
        });
        navigate("/login");
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Create investment record
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: project.id,
          amount: investmentAmount,
          duration: selectedDuration,
          yield_rate: project.yield,
          status: 'active',
          date: new Date().toISOString()
        });
        
      if (investmentError) throw investmentError;
      
      // Update user profile (increase investment_total and projects_count)
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      // Check if user has already invested in this project
      const { data: existingInvestments, error: countError } = await supabase
        .from('investments')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', project.id);
        
      if (countError) throw countError;
      
      // Only increment project count if this is a new project for the user
      const newProjectsCount = existingInvestments && existingInvestments.length <= 1 
        ? (userProfile.projects_count || 0) + 1 
        : userProfile.projects_count || 0;
      
      await supabase
        .from('profiles')
        .update({
          investment_total: (userProfile.investment_total || 0) + investmentAmount,
          projects_count: newProjectsCount
        })
        .eq('id', userId);
      
      // Save investment data to local storage
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
      
      setIsProcessing(false);
      setShowConfirmation(false);
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during investment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'investissement. Veuillez réessayer.",
        variant: "destructive"
      });
      setIsProcessing(false);
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

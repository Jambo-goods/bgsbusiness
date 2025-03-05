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
  const [userBalance, setUserBalance] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const minInvestment = 100;
  const maxInvestment = 10000;
  
  const durations = project.possibleDurations || 
    [parseInt(project.duration.split(' ')[0])];
  
  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', session.session.user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUserBalance(data.wallet_balance || 0);
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
      }
    };
    
    fetchUserBalance();
  }, []);
  
  useEffect(() => {
    const calculatedMonthlyReturn = investmentAmount * (project.yield / 100);
    const calculatedTotalReturn = investmentAmount + (calculatedMonthlyReturn * selectedDuration);
    
    setMonthlyReturn(calculatedMonthlyReturn);
    setTotalReturn(calculatedTotalReturn);
  }, [investmentAmount, selectedDuration, project.yield]);
  
  const handleInvest = () => {
    if (userBalance < investmentAmount) {
      toast({
        title: "Solde insuffisant",
        description: `Vous n'avez pas assez de fonds disponibles. Votre solde: ${userBalance}€`,
        variant: "destructive"
      });
      return;
    }
    
    setShowConfirmation(true);
  };
  
  const cancelInvestment = () => {
    setShowConfirmation(false);
  };
  
  const confirmInvestment = async () => {
    setIsProcessing(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous connecter pour investir",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      const userId = session.session.user.id;
      
      let projectUuid;
      
      console.log(`Attempting to find project with name: ${project.name}`);
      const { data: projectByName, error: nameError } = await supabase
        .from('projects')
        .select('id')
        .eq('name', project.name)
        .maybeSingle();
      
      if (nameError) {
        console.error("Error fetching project by name:", nameError);
        throw new Error("Erreur lors de la recherche du projet dans la base de données");
      }
      
      if (projectByName) {
        console.log("Found project by name:", projectByName);
        projectUuid = projectByName.id;
      } else {
        console.log("Project not found by name, checking if it exists in the database");
        
        console.log("Creating project in database:", project);
        const { data: newProject, error: insertError } = await supabase
          .from('projects')
          .insert({
            name: project.name,
            company_name: project.companyName,
            description: project.description,
            duration: project.duration,
            location: project.location,
            min_investment: project.minInvestment,
            category: project.category,
            price: project.price,
            yield: project.yield,
            funding_progress: project.fundingProgress,
            featured: project.featured || false,
            possible_durations: project.possibleDurations,
            status: project.status,
            profitability: project.profitability,
            image: project.image
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error("Error creating project:", insertError);
          throw new Error("Impossible de créer le projet dans la base de données");
        }
        
        projectUuid = newProject.id;
        console.log("Created new project with ID:", projectUuid);
      }
      
      if (!projectUuid) {
        throw new Error("Impossible de déterminer l'identifiant du projet");
      }
      
      console.log("Using project UUID:", projectUuid);
      
      const { error: walletError } = await supabase.rpc(
        'increment_wallet_balance',
        { user_id: userId, increment_amount: -investmentAmount }
      );
      
      if (walletError) {
        console.error("Wallet update error:", walletError);
        throw walletError;
      }
      
      const { error: investmentError } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          project_id: projectUuid,
          amount: investmentAmount,
          duration: selectedDuration,
          yield_rate: project.yield,
          status: 'active',
          date: new Date().toISOString()
        });
      
      if (investmentError) {
        console.error("Investment creation error:", investmentError);
        throw investmentError;
      }
      
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('investment_total, projects_count')
        .eq('id', userId)
        .single();
      
      if (profileFetchError) {
        console.error("Profile fetch error:", profileFetchError);
        throw profileFetchError;
      }
      
      const updates = {
        investment_total: (profileData.investment_total || 0) + investmentAmount,
        projects_count: (profileData.projects_count || 0) + 1
      };
      
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (profileUpdateError) {
        console.error("Profile update error:", profileUpdateError);
        throw profileUpdateError;
      }
      
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          amount: investmentAmount,
          type: 'withdrawal',
          description: `Investissement dans ${project.name}`
        });
      
      if (transactionError) {
        console.error("Transaction record error:", transactionError);
        throw transactionError;
      }
      
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
      
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Erreur lors de l'investissement:", error);
      toast({
        title: "Erreur lors de l'investissement",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de votre investissement.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };
  
  function isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

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

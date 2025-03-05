
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Project } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Import our new components
import FundingProgress from "./FundingProgress";
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
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const minInvestment = 100;
  const maxInvestment = 10000;
  
  // Get possible durations from project, or create an array from the project duration
  const durations = project.possibleDurations || 
    [parseInt(project.duration.split(' ')[0])];
  
  const handleInvest = () => {
    setShowConfirmation(true);
  };
  
  const confirmInvestment = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Investissement réussi !",
        description: `Vous avez investi ${investmentAmount}€ dans ${project.name} pour une durée de ${selectedDuration} mois.`,
      });
      
      setIsProcessing(false);
      setShowConfirmation(false);
      
      // Redirect to dashboard
      navigate("/dashboard");
    }, 2000);
  };
  
  const cancelInvestment = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium text-bgs-blue mb-4">Investir maintenant</h3>
      
      {!showConfirmation ? (
        <>
          <FundingProgress project={project} investorCount={investorCount} />
          
          <div className="mb-6">
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
            />
          </div>
          
          <button onClick={handleInvest} className="w-full btn-primary flex items-center justify-center gap-2">
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
        />
      )}
    </div>
  );
}

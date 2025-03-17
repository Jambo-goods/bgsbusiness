
import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Project } from "@/types/project";
import { useInvestment } from "@/hooks/useInvestment";

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
  // Add local state since useInvestment doesn't provide all needed properties
  const [investmentAmount, setInvestmentAmount] = useState(1000);
  const [selectedDuration, setSelectedDuration] = useState(12); // Default 12 months
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate returns based on project and selected options
  const yieldRate = project.yield || 7; // Default yield 7%
  const monthlyReturn = (investmentAmount * (yieldRate / 100)) / 12;
  const totalReturn = monthlyReturn * selectedDuration;
  
  // Define investment limits
  const minInvestment = 500;
  const maxInvestment = 50000;
  
  // Available durations
  const durations = [6, 12, 24, 36];
  
  // Get investment functions from hook
  const {
    confirmInvestment,
    isLoading,
    isError,
    error,
    handleCancel: cancelConfirmation
  } = useInvestment();

  // Handler for invest button
  const handleInvest = () => {
    setShowConfirmation(true);
  };
  
  // Handler for cancel
  const cancelInvestment = () => {
    setShowConfirmation(false);
    cancelConfirmation();
  };
  
  // Handler for confirm investment
  const confirmInvestmentHandler = () => {
    setIsProcessing(true);
    confirmInvestment({ 
      amount: investmentAmount,
      project_id: project.id
    });
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
          isProcessing={isProcessing || isLoading}
          onConfirm={confirmInvestmentHandler}
          onCancel={cancelInvestment}
          monthlyReturn={monthlyReturn}
          totalReturn={totalReturn}
        />
      )}
    </div>
  );
}

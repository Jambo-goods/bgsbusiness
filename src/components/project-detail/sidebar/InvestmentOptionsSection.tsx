
import React from "react";
import { ArrowRight } from "lucide-react";
import { Project } from "@/types/project";
import { useInvestment } from "@/hooks/useInvestment";
import { useToast } from "@/hooks/use-toast";
import { createLayingHensProject } from "@/utils/projectUtils";

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
  const { toast } = useToast();
  const {
    investmentAmount,
    setInvestmentAmount,
    showConfirmation,
    isProcessing,
    selectedDuration,
    setSelectedDuration,
    totalReturn,
    monthlyReturn,
    minInvestment,
    maxInvestment,
    durations,
    handleInvest,
    cancelInvestment,
    confirmInvestment
  } = useInvestment(project, investorCount);

  const handleCreateLayingHensProject = async () => {
    try {
      await createLayingHensProject(toast);
      toast({
        title: "Nouveau projet créé",
        description: "Le projet de poules pondeuses a été créé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 transform transition-all duration-300 hover:shadow-lg">
      <h3 className="text-xl font-semibold text-bgs-blue mb-5 flex items-center">
        <span className="bg-bgs-orange/10 text-bgs-orange p-1.5 rounded-lg mr-2">
          <ArrowRight size={16} />
        </span>
        Investir maintenant
      </h3>
      
      {/* Button to create the laying hens project */}
      <button 
        onClick={handleCreateLayingHensProject} 
        className="mb-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
      >
        Créer Projet Poules Pondeuses
        <ArrowRight size={18} />
      </button>
      
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

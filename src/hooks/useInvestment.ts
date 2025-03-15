
import { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { calculateReturns } from "@/utils/investmentCalculations";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useInvestmentConfirmation } from "@/hooks/useInvestmentConfirmation";

export const useInvestment = (project: Project, investorCount: number) => {
  const [investmentAmount, setInvestmentAmount] = useState(project.minInvestment || 500);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(
    project.possibleDurations ? project.possibleDurations[0] : parseInt(project.duration)
  );
  const [totalReturn, setTotalReturn] = useState(0);
  const [monthlyReturn, setMonthlyReturn] = useState(0);
  const { toast } = useToast();
  
  const { userBalance } = useUserBalance();
  
  // Extract constants from project
  const minInvestment = project.minInvestment;
  const maxInvestment = project.maxInvestment || 10000;
  const firstPaymentDelay = project.firstPaymentDelayMonths || 1;
  
  const durations = project.possibleDurations || 
    [parseInt(project.duration.split(' ')[0])];
  
  // Calculate investment returns when parameters change
  useEffect(() => {
    const { monthlyReturn: calculatedMonthlyReturn, totalReturn: calculatedTotalReturn } = 
      calculateReturns(investmentAmount, project.yield, selectedDuration, firstPaymentDelay);
    
    setMonthlyReturn(calculatedMonthlyReturn);
    setTotalReturn(calculatedTotalReturn);
  }, [investmentAmount, selectedDuration, project.yield, firstPaymentDelay]);
  
  // Validation and confirmation handling
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

  // Use the confirmation hook
  const { isProcessing, confirmInvestment } = useInvestmentConfirmation(
    project, 
    investorCount,
    investmentAmount,
    selectedDuration,
    monthlyReturn,
    totalReturn,
    userBalance,
    firstPaymentDelay
  );

  return {
    investmentAmount,
    setInvestmentAmount,
    showConfirmation,
    setShowConfirmation,
    isProcessing,
    selectedDuration,
    setSelectedDuration,
    totalReturn,
    monthlyReturn,
    minInvestment,
    maxInvestment,
    durations,
    userBalance,
    handleInvest,
    cancelInvestment,
    confirmInvestment
  };
};

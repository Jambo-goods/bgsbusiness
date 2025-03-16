
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";
import { useInvestmentConfirmation } from "./useInvestmentConfirmation";

export const useInvestment = (project: Project, investorCount: number) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(project.minInvestment || 100);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(12);
  const [userId, setUserId] = useState<string | null>(null);

  const minInvestment = project.minInvestment || 100;
  const maxInvestment = project.maxInvestment || 10000;

  // Available durations
  const durations = [6, 12, 24, 36];

  // Calculate expected returns
  const monthlyYieldPercentage = project.yield || 1;
  const monthlyReturn = (investmentAmount * monthlyYieldPercentage) / 100;
  const totalReturn = monthlyReturn * selectedDuration;

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };
    
    getUserId();
  }, []);

  // Use the investment confirmation hook
  const {
    isConfirming,
    isSuccess,
    error,
    confirmInvestment
  } = useInvestmentConfirmation({
    userId: userId || "",
    projectId: project.id,
    amount: investmentAmount,
    duration: selectedDuration
  });

  const handleInvest = async () => {
    if (!userId) {
      toast.error("Vous devez être connecté pour investir");
      return;
    }
    
    // Check if the amount is within the allowed range
    if (investmentAmount < minInvestment) {
      toast.error(`L'investissement minimum est de ${minInvestment}€`);
      return;
    }
    
    if (investmentAmount > maxInvestment) {
      toast.error(`L'investissement maximum est de ${maxInvestment}€`);
      return;
    }
    
    setShowConfirmation(true);
  };
  
  const cancelInvestment = () => {
    setShowConfirmation(false);
  };
  
  return {
    investmentAmount,
    setInvestmentAmount,
    showConfirmation,
    isProcessing: isConfirming,
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
  };
};

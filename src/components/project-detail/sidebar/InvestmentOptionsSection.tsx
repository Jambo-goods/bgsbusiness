import React, { useState } from "react";
import { Project } from "@/types/project";
import InvestmentConfirmation from "./InvestmentConfirmation";
import DurationSection from "./DurationSection";
import InvestmentAmountSection from "./InvestmentAmountSection";
import InvestmentSummary from "./InvestmentSummary";
import { useInvestment } from "@/hooks/useInvestment";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import InvestmentFormSkeleton from './InvestmentFormSkeleton';

interface InvestmentOptionsSectionProps {
  project: Project;
  investorCount: number;
}

export default function InvestmentOptionsSection({
  project,
  investorCount
}: InvestmentOptionsSectionProps) {
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

  return (
    <div className="bg-white border border-bgs-gray-light rounded-lg p-4 mb-4">
      <h3 className="font-medium text-bgs-blue mb-4">Options d'investissement</h3>
      
      {!showConfirmation ? (
        <>
          <DurationSection 
            durations={durations}
            selectedDuration={selectedDuration}
            onChange={setSelectedDuration}
          />
          
          <InvestmentAmountSection 
            minInvestment={minInvestment}
            maxInvestment={maxInvestment}
            investmentAmount={investmentAmount}
            onChange={setInvestmentAmount}
          />
          
          <InvestmentSummary 
            project={project}
            investmentAmount={investmentAmount}
            duration={selectedDuration}
            onInvest={handleInvest}
            monthlyReturn={monthlyReturn}
            totalReturn={totalReturn}
          />
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


import React, { useState, useEffect } from "react";
import { Project } from "@/types/project";
import CompanyInfoSection from "./sidebar/CompanyInfoSection";
import PerformanceSection from "./sidebar/PerformanceSection";
import ViewCounter from "./sidebar/ViewCounter";
import InvestmentAmountSection from "./sidebar/InvestmentAmountSection";
import DurationSection from "./sidebar/DurationSection";
import InvestmentOptionsSection from "./sidebar/InvestmentOptionsSection";

interface ProjectSidebarProps {
  project: Project;
  remainingDays: number;
  investorCount: number;
}

export default function ProjectSidebar({
  project,
  remainingDays,
  investorCount
}: ProjectSidebarProps) {
  const [investmentAmount, setInvestmentAmount] = useState(project.minInvestment);
  const [selectedDuration, setSelectedDuration] = useState(
    project.possibleDurations ? project.possibleDurations[0] : 12
  );
  
  // Handle investment confirmation
  const handleInvestmentConfirmed = () => {
    console.log("Investment confirmed");
  };

  return (
    <div className="sticky top-24 space-y-4 animate-fade-up">
      <CompanyInfoSection project={project} />
      
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <h3 className="font-medium text-bgs-blue mb-4">Investir dans ce projet</h3>
        
        <InvestmentAmountSection 
          investmentAmount={investmentAmount}
          setInvestmentAmount={setInvestmentAmount}
          minInvestment={project.minInvestment}
          maxInvestment={Math.min(project.price, 20000)}
        />
        
        <DurationSection 
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          durations={project.possibleDurations || [12, 24, 36]}
        />
        
        <InvestmentOptionsSection 
          project={project}
          selectedAmount={investmentAmount}
          selectedDuration={selectedDuration}
          minInvestment={project.minInvestment}
          expectedYield={project.yield}
          onInvestmentConfirmed={handleInvestmentConfirmed}
        />
      </div>
      
      <PerformanceSection project={project} />
      <ViewCounter />
    </div>
  );
}

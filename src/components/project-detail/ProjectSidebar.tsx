
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
    <div className="sticky top-24 space-y-6 animate-fade-up">
      <CompanyInfoSection project={project} />
      
      <div className="bg-gradient-to-br from-white to-bgs-gray-light rounded-xl shadow-premium p-6 border border-gray-100">
        <h3 className="font-semibold text-bgs-blue mb-5 text-xl flex items-center">
          <span className="bg-bgs-orange/10 text-bgs-orange p-1.5 rounded-md mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          Investir dans ce projet
        </h3>
        
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

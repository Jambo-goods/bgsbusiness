
import React from "react";
import { Project } from "@/types/project";
import CompanyInfoSection from "./sidebar/CompanyInfoSection";
import InvestmentOptionsSection from "./sidebar/InvestmentOptionsSection";
import PerformanceSection from "./sidebar/PerformanceSection";
import ViewCounter from "./sidebar/ViewCounter";

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
  // Setting default values that InvestmentOptionsSection expects
  const [selectedAmount, setSelectedAmount] = React.useState(project.minInvestment);
  const [selectedDuration, setSelectedDuration] = React.useState(
    project.possibleDurations ? project.possibleDurations[0] : 12
  );
  const minInvestment = project.minInvestment;
  const expectedYield = project.yield;
  
  // Create a function to handle investment confirmation
  const handleInvestmentConfirmed = () => {
    // This function will be called when an investment is confirmed
    console.log("Investment confirmed");
  };

  return (
    <div className="sticky top-24 space-y-4 animate-fade-up">
      <CompanyInfoSection project={project} />
      <InvestmentOptionsSection 
        project={project}
        selectedAmount={selectedAmount}
        selectedDuration={selectedDuration}
        minInvestment={minInvestment}
        expectedYield={expectedYield}
        onInvestmentConfirmed={handleInvestmentConfirmed}
      />
      <PerformanceSection project={project} />
      <ViewCounter />
    </div>
  );
}

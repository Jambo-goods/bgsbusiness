
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
  // Add default values for project to prevent undefined errors
  const safeProject = {
    ...project,
    minInvestment: project.min_investment || 500,
    yield: project.yield || 0.8,
    duration: project.duration || "12 mois"
  };

  return (
    <div className="sticky top-24 space-y-4 animate-fade-up">
      <CompanyInfoSection project={safeProject} />
      <InvestmentOptionsSection project={safeProject} investorCount={investorCount} />
      <PerformanceSection project={safeProject} />
      <ViewCounter />
    </div>
  );
}

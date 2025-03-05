
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
  return (
    <div className="sticky top-24 space-y-4 animate-fade-up">
      <CompanyInfoSection project={project} />
      <InvestmentOptionsSection project={project} investorCount={investorCount} />
      <PerformanceSection project={project} />
      <ViewCounter />
    </div>
  );
}


import React from "react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";

interface FundingProgressProps {
  project: Project;
  investorCount: number;
}

export default function FundingProgress({ project, investorCount }: FundingProgressProps) {
  const raised = project.raised || project.price * (project.fundingProgress / 100);
  const target = project.target || project.price;
  const progressPercentage = (raised / target) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-bgs-blue/70">{progressPercentage.toFixed(0)}% financé</span>
        <span className="text-sm font-medium text-bgs-blue">{raised.toLocaleString()}€ / {target.toLocaleString()}€</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="flex justify-between items-center mt-2 mb-2">
        <span className="text-sm text-bgs-blue/70">{investorCount} investisseurs</span>
        <span className="text-sm text-bgs-blue/70">Objectif: {target.toLocaleString()}€</span>
      </div>
    </div>
  );
}

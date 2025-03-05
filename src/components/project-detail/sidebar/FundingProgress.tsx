
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";
import { Users, Target } from "lucide-react";

interface FundingProgressProps {
  project: Project;
  investorCount: number;
}

export default function FundingProgress({ project, investorCount }: FundingProgressProps) {
  const raised = project.raised || project.price * (project.fundingProgress / 100);
  const target = project.target || project.price;
  const progressPercentage = (raised / target) * 100;

  return (
    <div className="mb-6 p-3 bg-gradient-to-br from-white to-bgs-gray-light rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-bgs-blue flex items-center gap-1.5">
          <div className="bg-bgs-blue/10 p-1 rounded-full">
            <Target size={14} className="text-bgs-blue" />
          </div>
          Progression
        </span>
        <span className="text-sm font-bold text-bgs-orange">{progressPercentage.toFixed(0)}% financé</span>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-bgs-blue/70">Objectif</span>
          <span className="text-sm font-medium text-bgs-blue">{raised.toLocaleString()}€ / {target.toLocaleString()}€</span>
        </div>
        <Progress value={progressPercentage} className="h-2.5" indicatorClassName="bg-gradient-to-r from-bgs-orange to-bgs-orange-light" />
      </div>
      
      <div className="flex items-center mt-3 text-bgs-blue/70">
        <Users size={14} className="mr-1.5" />
        <span className="text-sm">{investorCount} investisseurs</span>
      </div>
    </div>
  );
}

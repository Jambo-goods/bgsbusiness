
import React from "react";
import { Project } from "@/types/project";

interface InvestmentSummaryProps {
  project: Project;
  selectedDuration: number;
}

export default function InvestmentSummary({ project, selectedDuration }: InvestmentSummaryProps) {
  return (
    <div className="bg-bgs-blue/5 p-3 rounded-lg mb-4">
      <div className="flex justify-between text-sm text-bgs-blue mb-1">
        <span>Rendement estimé</span>
        <span className="font-medium">{project.yield}%</span>
      </div>
      <div className="flex justify-between text-sm text-bgs-blue">
        <span>Durée</span>
        <span className="font-medium">{selectedDuration} mois</span>
      </div>
    </div>
  );
}

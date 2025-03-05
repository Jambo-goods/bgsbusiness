
import React from "react";
import { Project } from "@/types/project";
import { TrendingUp, Clock } from "lucide-react";

interface InvestmentSummaryProps {
  project: Project;
  selectedDuration: number;
}

export default function InvestmentSummary({ project, selectedDuration }: InvestmentSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-white to-bgs-gray-light p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
      <h4 className="text-sm font-medium text-bgs-blue mb-3">Résumé de l'investissement</h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-bgs-blue">
            <div className="bg-bgs-orange/10 p-1.5 rounded-lg">
              <TrendingUp size={14} className="text-bgs-orange" />
            </div>
            <span>Rendement estimé</span>
          </div>
          <span className="font-semibold text-bgs-orange">{project.yield}%</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 text-bgs-blue">
            <div className="bg-bgs-blue/10 p-1.5 rounded-lg">
              <Clock size={14} className="text-bgs-blue" />
            </div>
            <span>Durée</span>
          </div>
          <span className="font-semibold text-bgs-blue">{selectedDuration} mois</span>
        </div>
      </div>
    </div>
  );
}

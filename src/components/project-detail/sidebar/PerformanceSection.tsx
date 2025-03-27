
import React from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Project } from "@/types/project";

interface PerformanceSectionProps {
  project: Project;
}

export default function PerformanceSection({ project }: PerformanceSectionProps) {
  // Calculate annual yield from monthly yield
  const annualYield = project.yield * 12;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <h3 className="font-medium text-bgs-blue mb-3">Performance attendue</h3>
      
      <div className="flex items-center mb-3">
        <div className="p-1.5 bg-green-50 rounded-md mr-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <p className="text-xs text-bgs-blue/70">Rendement mensuel</p>
          <p className="text-sm font-bold text-green-600">{project.yield}% par mois</p>
        </div>
      </div>
      
      <div className="flex items-center mb-3">
        <div className="p-1.5 bg-green-50 rounded-md mr-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <p className="text-xs text-bgs-blue/70">Rendement annualisé</p>
          <p className="text-sm font-bold text-green-600">{annualYield.toFixed(2)}% par an</p>
        </div>
      </div>
      
      <p className="text-xs text-bgs-blue/70 mb-2">
        Ce rendement mensuel de {project.yield}% ({annualYield.toFixed(2)}% annualisé par an) est une estimation basée sur les performances historiques de projets similaires. 
        Les rendements réels peuvent varier.
      </p>
      
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
        <div className="flex items-start">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-xs text-bgs-blue/80">
            Tout investissement comporte des risques. Veuillez lire les documents du projet pour une compréhension complète.
          </p>
        </div>
      </div>
    </div>
  );
}

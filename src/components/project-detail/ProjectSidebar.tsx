
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";

interface ProjectSidebarProps {
  project: Project;
  remainingDays: number;
  investorCount: number;
}

export default function ProjectSidebar({ project, remainingDays, investorCount }: ProjectSidebarProps) {
  return (
    <div className="sticky top-32">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-4 animate-fade-up">
        <h2 className="text-xl font-semibold text-bgs-blue mb-4">Investir maintenant</h2>
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-bgs-blue mb-2">
            <span>Progression</span>
            <span className="font-medium">{project.fundingProgress}%</span>
          </div>
          <Progress value={project.fundingProgress} className="h-2" />
          <div className="flex justify-between text-sm mt-2">
            <span className="text-bgs-blue/60">0€</span>
            <span className="text-bgs-blue/60">{project.price}€</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-bgs-blue/70 mr-3" />
              <span className="text-sm text-bgs-blue">Investisseurs</span>
            </div>
            <span className="font-medium text-bgs-blue">{investorCount}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-bgs-blue/70 mr-3" />
              <span className="text-sm text-bgs-blue">Jours restants</span>
            </div>
            <span className="font-medium text-bgs-blue">{remainingDays}</span>
          </div>
        </div>
        
        {/* CTA */}
        <Button className="w-full bg-bgs-orange hover:bg-bgs-orange-light">
          Investir maintenant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      {/* Related info */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
        <h3 className="text-lg font-semibold text-bgs-blue mb-4">En savoir plus</h3>
        <div className="space-y-3">
          <a href="#" className="flex items-center justify-between py-2 border-b border-gray-100 text-bgs-blue hover:text-bgs-orange transition-colors">
            <span>Qui peut investir ?</span>
            <ChevronRight className="h-4 w-4" />
          </a>
          <a href="#" className="flex items-center justify-between py-2 border-b border-gray-100 text-bgs-blue hover:text-bgs-orange transition-colors">
            <span>Comment fonctionne le rendement ?</span>
            <ChevronRight className="h-4 w-4" />
          </a>
          <a href="#" className="flex items-center justify-between py-2 border-b border-gray-100 text-bgs-blue hover:text-bgs-orange transition-colors">
            <span>Sécurité de l'investissement</span>
            <ChevronRight className="h-4 w-4" />
          </a>
          <a href="#" className="flex items-center justify-between py-2 text-bgs-blue hover:text-bgs-orange transition-colors">
            <span>Fiscalité applicable</span>
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

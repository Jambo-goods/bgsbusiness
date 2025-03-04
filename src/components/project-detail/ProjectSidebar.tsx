
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock, Calendar, TrendingUp, AlertCircle, Eye } from "lucide-react";
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  project: Project;
  remainingDays: number;
  investorCount: number;
}

export default function ProjectSidebar({ project, remainingDays, investorCount }: ProjectSidebarProps) {
  return (
    <div className="sticky top-32 space-y-5 animate-fade-up">
      {/* Project Status Card */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-bgs-blue">Financement</span>
              <span className="text-sm font-bold text-bgs-blue">{project.fundingProgress}%</span>
            </div>
            <Progress 
              value={project.fundingProgress} 
              className="h-2 bg-gray-100" 
              indicatorClassName={cn(
                "bg-gradient-to-r",
                project.fundingProgress < 30 ? "from-amber-400 to-amber-500" :
                project.fundingProgress < 70 ? "from-bgs-orange to-amber-500" :
                "from-green-400 to-green-500"
              )}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-bgs-gray-medium">Collecté: {Math.round(project.price * project.fundingProgress / 100).toLocaleString()} €</span>
              <span className="text-xs text-bgs-gray-medium">Objectif: {project.price.toLocaleString()} €</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="p-1.5 bg-blue-50 rounded-md mr-2">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-bgs-blue/70">Investisseurs</p>
                  <p className="text-sm font-semibold text-bgs-blue">{investorCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="p-1.5 bg-amber-50 rounded-md mr-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-bgs-blue/70">Jours restants</p>
                  <p className="text-sm font-semibold text-bgs-blue">{remainingDays}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Investment Details */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div className="flex justify-between">
              <span className="text-sm text-bgs-blue/80">Investissement min.</span>
              <span className="text-sm font-medium text-bgs-blue">{project.minInvestment.toLocaleString()} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bgs-blue/80">Rendement cible</span>
              <span className="text-sm font-medium text-green-600">{project.yield}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-bgs-blue/80">Durée</span>
              <span className="text-sm font-medium text-bgs-blue">{project.duration}</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <Button 
            className="w-full bg-bgs-orange hover:bg-bgs-orange-light text-white rounded-lg py-6 font-medium flex items-center justify-center"
          >
            Investir maintenant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Quick Info */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="font-medium text-bgs-blue mb-3">Dates importantes</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="p-1.5 bg-purple-50 rounded-md mr-2">
              <Calendar className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-bgs-blue/70">Date de début</p>
              <p className="text-sm font-medium text-bgs-blue">
                {new Date(project.startDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-1.5 bg-green-50 rounded-md mr-2">
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-bgs-blue/70">Date de fin estimée</p>
              <p className="text-sm font-medium text-bgs-blue">
                {new Date(project.endDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="font-medium text-bgs-blue mb-3">Performance attendue</h3>
        <div className="flex items-center mb-3">
          <div className="p-1.5 bg-green-50 rounded-md mr-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70">Rendement annualisé</p>
            <p className="text-sm font-bold text-green-600">{project.yield}%</p>
          </div>
        </div>
        <p className="text-xs text-bgs-blue/70 mb-2">
          Ce rendement est une estimation basée sur les performances historiques de projets similaires. 
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
      
      {/* View Count */}
      <div className="flex items-center justify-center text-xs text-bgs-blue/60">
        <Eye className="h-3 w-3 mr-1" />
        <span>{100 + Math.floor(Math.random() * 900)} personnes ont consulté ce projet</span>
      </div>
    </div>
  );
}

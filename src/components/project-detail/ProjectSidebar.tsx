
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock, Calendar, TrendingUp, AlertCircle, Eye, Building, MapPin, DollarSign } from "lucide-react";
import { Project } from "@/types/project";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const progressPercentage = project.fundingProgress;
  const [userBalance] = useState<number>(1000); // Simuler le solde utilisateur

  const handleInvestClick = () => {
    if (progressPercentage >= 100) {
      toast.info("Ce projet est entièrement financé", {
        description: "Découvrez d'autres opportunités d'investissement dans notre catalogue."
      });
      return;
    }
    
    if (project.minInvestment > userBalance) {
      toast.error("Solde insuffisant", {
        description: "Veuillez recharger votre compte avant de procéder à cet investissement.",
        action: {
          label: "Déposer des fonds",
          onClick: () => console.log("Redirection vers la page de dépôt")
        }
      });
    } else {
      toast.success("Redirection vers la page d'investissement", {
        description: "Vous allez pouvoir sélectionner votre montant et la durée."
      });
      // Simuler la redirection
      setTimeout(() => {
        console.log("Redirection vers la page d'investissement");
      }, 1000);
    }
  };

  return (
    <div className="sticky top-24 space-y-4 animate-fade-up">
      {/* Informations de l'entreprise */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <div className="flex items-center mb-4">
          <Building className="h-5 w-5 text-bgs-blue mr-2" />
          <h3 className="font-medium text-bgs-blue">Informations de l'entreprise</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="p-1.5 bg-blue-50 rounded-md mr-2">
              <Building className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-bgs-blue/70">Nom de l'entreprise</p>
              <p className="text-sm font-semibold text-bgs-blue">{project.companyName}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="p-1.5 bg-green-50 rounded-md mr-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-bgs-blue/70">Rentabilité estimée</p>
              <p className="text-sm font-semibold text-green-600">{project.yield}%</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="p-1.5 bg-amber-50 rounded-md mr-2">
              <MapPin className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-bgs-blue/70">Localisation</p>
              <p className="text-sm font-semibold text-bgs-blue">{project.location}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Project Status Card */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-bgs-blue">Progression</h3>
              <span className="text-sm font-semibold text-bgs-orange">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} size="md" showValue={false} />
            <div className="flex justify-between text-xs text-bgs-blue/70">
              <span>Collecté: {Math.round(project.price * progressPercentage / 100).toLocaleString()} €</span>
              <span>Objectif: {project.price.toLocaleString()} €</span>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
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
            <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
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
            onClick={handleInvestClick}
            className={cn(
              "w-full text-white rounded-lg py-6 font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all",
              userBalance < project.minInvestment ? "bg-gray-400 hover:bg-gray-500" : "bg-bgs-orange hover:bg-bgs-orange-light"
            )}
          >
            {userBalance < project.minInvestment ? "Solde insuffisant" : "Investir maintenant"}
            {userBalance >= project.minInvestment && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
          
          {userBalance < project.minInvestment && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mt-2">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-bgs-blue/80">
                  Votre solde actuel ({userBalance.toLocaleString()} €) est insuffisant pour l'investissement minimum de {project.minInvestment.toLocaleString()} €
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Project Metrics */}
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
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
      <div className="flex items-center justify-center text-xs text-bgs-blue/60 bg-white rounded-lg py-2 shadow-sm border border-gray-100">
        <Eye className="h-3 w-3 mr-1" />
        <span>{100 + Math.floor(Math.random() * 900)} personnes ont consulté ce projet</span>
      </div>
    </div>
  );
}

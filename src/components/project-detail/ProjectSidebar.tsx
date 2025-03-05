
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, AlertCircle, Eye, Building, MapPin } from "lucide-react";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

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
  const [investmentAmount, setInvestmentAmount] = useState<number>(project.minInvestment);
  const [duration, setDuration] = useState<number>(
    project.possibleDurations ? project.possibleDurations[0] : 12
  );
  const [totalReturn, setTotalReturn] = useState<number>(0);
  const [monthlyReturn, setMonthlyReturn] = useState<number>(0);
  
  // Calculer les rendements lorsque les entrées changent
  useEffect(() => {
    // Rendement annuel converti en rendement pour la durée sélectionnée
    const returnRate = (project.yield / 100) * (duration / 12);
    const calculatedTotalReturn = investmentAmount * (1 + returnRate);
    const calculatedMonthlyReturn = calculatedTotalReturn / duration;
    
    setTotalReturn(calculatedTotalReturn);
    setMonthlyReturn(calculatedMonthlyReturn);
  }, [investmentAmount, duration, project.yield]);

  const handleInvestClick = () => {
    if (progressPercentage >= 100) {
      toast.info("Ce projet est entièrement financé", {
        description: "Découvrez d'autres opportunités d'investissement dans notre catalogue."
      });
      return;
    }
    
    if (investmentAmount > userBalance) {
      toast.error("Solde insuffisant", {
        description: "Veuillez recharger votre compte avant de procéder à cet investissement.",
        action: {
          label: "Déposer des fonds",
          onClick: () => console.log("Redirection vers la page de dépôt")
        }
      });
    } else {
      toast.success("Redirection vers la page d'investissement", {
        description: "Vous allez pouvoir confirmer votre montant de " + investmentAmount + "€ sur " + duration + " mois."
      });
      // Simuler la redirection
      setTimeout(() => {
        console.log("Redirection vers la page d'investissement avec montant:", investmentAmount, "et durée:", duration);
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
          {/* Stats */}
          <div className="grid grid-cols-1 gap-3 my-4">
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
          </div>
          
          {/* Investment Amount */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-bgs-blue">Montant à investir</label>
              <span className="text-sm font-bold text-bgs-blue">{investmentAmount.toLocaleString()} €</span>
            </div>
            <Slider
              value={[investmentAmount]}
              min={project.minInvestment}
              max={Math.min(project.price, 20000)}
              step={100}
              onValueChange={(value) => setInvestmentAmount(value[0])}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-bgs-blue/60">
              <span>Min: {project.minInvestment} €</span>
              <span>Max: {Math.min(project.price, 20000).toLocaleString()} €</span>
            </div>
          </div>
          
          {/* Investment Duration */}
          {project.possibleDurations && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-bgs-blue">Durée d'investissement</label>
                <span className="text-sm font-bold text-bgs-blue">{duration} mois</span>
              </div>
              <div className="flex justify-between gap-2">
                {project.possibleDurations.map((months) => (
                  <button
                    key={months}
                    onClick={() => setDuration(months)}
                    className={`flex-1 py-2 px-1 text-sm rounded-md transition-colors ${
                      duration === months
                        ? "bg-bgs-blue text-white"
                        : "bg-gray-100 text-bgs-blue hover:bg-gray-200"
                    }`}
                  >
                    {months} mois
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Return Calculation */}
          <div className="p-3 bg-bgs-gray-light rounded-lg mb-4">
            <h3 className="text-sm font-medium text-bgs-blue mb-2">Simulation de rendement</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-bgs-blue/70">Retour total estimé</p>
                <p className="text-sm font-semibold text-bgs-blue">{totalReturn.toLocaleString(undefined, {maximumFractionDigits: 2})} €</p>
              </div>
              <div>
                <p className="text-xs text-bgs-blue/70">Retour mensuel</p>
                <p className="text-sm font-semibold text-bgs-blue">{monthlyReturn.toLocaleString(undefined, {maximumFractionDigits: 2})} €</p>
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
          </div>
          
          {/* CTA Button */}
          <Button 
            onClick={handleInvestClick}
            className={cn(
              "w-full text-white rounded-lg py-6 font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all",
              investmentAmount > userBalance ? "bg-gray-400 hover:bg-gray-500" : "bg-bgs-orange hover:bg-bgs-orange-light"
            )}
          >
            {investmentAmount > userBalance ? "Solde insuffisant" : "Investir maintenant"}
            {investmentAmount <= userBalance && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
          
          {investmentAmount > userBalance && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mt-2">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-bgs-blue/80">
                  Votre solde actuel ({userBalance.toLocaleString()} €) est insuffisant pour l'investissement de {investmentAmount.toLocaleString()} €
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

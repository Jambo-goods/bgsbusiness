
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, AlertCircle, Clock, CalendarClock } from "lucide-react";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface InvestmentOptionsSectionProps {
  project: Project;
  investorCount: number;
}

export default function InvestmentOptionsSection({ 
  project, 
  investorCount 
}: InvestmentOptionsSectionProps) {
  const progressPercentage = project.fundingProgress;
  const [userBalance] = useState<number>(1000); // Simuler le solde utilisateur
  const [investmentAmount, setInvestmentAmount] = useState<number>(project.minInvestment);
  const [duration, setDuration] = useState<number>(
    project.possibleDurations ? project.possibleDurations[0] : 12
  );
  const [totalReturn, setTotalReturn] = useState<number>(0);
  const [monthlyReturn, setMonthlyReturn] = useState<number>(0);
  const [useSlider, setUseSlider] = useState<boolean>(true);
  
  useEffect(() => {
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
      setTimeout(() => {
        console.log("Redirection vers la page d'investissement avec montant:", investmentAmount, "et durée:", duration);
      }, 1000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      // Ensure input is within min-max range
      const clampedValue = Math.min(
        Math.max(value, project.minInvestment),
        Math.min(project.price, 20000)
      );
      setInvestmentAmount(clampedValue);
    }
  };

  const toggleInputMethod = () => {
    setUseSlider(!useSlider);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="space-y-4">
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
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-bgs-blue">Montant à investir</label>
            <button 
              onClick={toggleInputMethod}
              className="text-xs text-bgs-blue bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              {useSlider ? "Saisie manuelle" : "Utiliser le curseur"}
            </button>
          </div>
          
          {useSlider ? (
            <>
              <div className="flex justify-between items-center mb-2">
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
            </>
          ) : (
            <div className="mb-2">
              <Input
                type="number"
                value={investmentAmount}
                onChange={handleInputChange}
                min={project.minInvestment}
                max={Math.min(project.price, 20000)}
                className="w-full border-gray-200"
              />
            </div>
          )}
          
          <div className="flex justify-between text-xs text-bgs-blue/60">
            <span>Min: {project.minInvestment} €</span>
            <span>Max: {Math.min(project.price, 20000).toLocaleString()} €</span>
          </div>
        </div>
        
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
                  className={`flex-1 py-3 text-sm rounded-md transition-colors ${
                    duration === months
                      ? "bg-bgs-blue text-white"
                      : "bg-gray-100 text-bgs-blue hover:bg-gray-200"
                  }`}
                >
                  {months} mois
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-bgs-blue/60">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Min: {Math.min(...project.possibleDurations!)} mois</span>
              </div>
              <div className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-1" />
                <span>Max: {Math.max(...project.possibleDurations!)} mois</span>
              </div>
            </div>
          </div>
        )}
        
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
  );
}

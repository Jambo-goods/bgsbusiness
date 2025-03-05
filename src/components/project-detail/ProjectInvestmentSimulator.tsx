
import React, { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { Slider } from "@/components/ui/slider";
import { Check, AlertCircle, Calculator, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface ProjectInvestmentSimulatorProps {
  project: Project;
}

export default function ProjectInvestmentSimulator({ project }: ProjectInvestmentSimulatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState<number>(project.minInvestment);
  const [duration, setDuration] = useState<number>(
    project.possibleDurations ? project.possibleDurations[0] : 12
  );
  const [totalReturn, setTotalReturn] = useState<number>(0);
  const [monthlyReturn, setMonthlyReturn] = useState<number>(0);
  const [userBalance] = useState<number>(1000); // Simuler le solde utilisateur
  
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
    if (investmentAmount > userBalance) {
      toast.error("Solde insuffisant", {
        description: "Veuillez recharger votre compte avant de procéder à cet investissement.",
        action: {
          label: "Déposer des fonds",
          onClick: () => console.log("Redirection vers la page de dépôt")
        }
      });
    } else {
      toast.success("Investissement en cours de traitement", {
        description: "Vous allez être redirigé vers la page de confirmation."
      });
      // Redirection vers la page de confirmation (simulation)
      setTimeout(() => {
        console.log("Redirection vers la page de confirmation avec:", {
          projectId: project.id,
          amount: investmentAmount,
          duration
        });
      }, 1500);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-up">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4 flex items-center">
        <Calculator className="mr-2 h-5 w-5 text-bgs-orange" />
        Simulateur d'investissement
      </h2>
      
      <div className="mb-6">
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
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-bgs-blue">Durée d'investissement</label>
          <span className="text-sm font-bold text-bgs-blue">{duration} mois</span>
        </div>
        {project.possibleDurations && (
          <div className="flex justify-between gap-2 mb-2">
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
        )}
      </div>
      
      <div className="bg-bgs-gray-light p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-bgs-blue mb-3">Simulation de rendement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Rendement estimé</p>
            <div className="flex items-center text-green-600 font-bold">
              <TrendingUp className="h-4 w-4 mr-1" />
              {project.yield}% par an
            </div>
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Durée choisie</p>
            <div className="flex items-center text-bgs-blue font-bold">
              <Calendar className="h-4 w-4 mr-1 text-bgs-blue/70" />
              {duration} mois
            </div>
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Retour total estimé</p>
            <p className="text-bgs-blue font-bold">{totalReturn.toLocaleString(undefined, {maximumFractionDigits: 2})} €</p>
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Retour mensuel estimé</p>
            <p className="text-bgs-blue font-bold">{monthlyReturn.toLocaleString(undefined, {maximumFractionDigits: 2})} €</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-xs text-bgs-blue/80">Investissement sécurisé par contrat</p>
        </div>
        <div className="flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-xs text-bgs-blue/80">Paiements mensuels directement sur votre compte</p>
        </div>
        <div className="flex items-start">
          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
          <p className="text-xs text-bgs-blue/80">Suivi en temps réel de votre investissement</p>
        </div>
      </div>
      
      {investmentAmount > userBalance && (
        <div className="mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
          <div className="flex items-start">
            <AlertCircle size={16} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-bgs-blue/80">
                Votre solde actuel ({userBalance.toLocaleString()} €) est insuffisant pour cet investissement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

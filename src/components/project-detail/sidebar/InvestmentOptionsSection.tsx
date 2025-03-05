
import React, { useState } from "react";
import { ArrowRight, Edit, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/project";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface InvestmentOptionsSectionProps {
  project: Project;
  investorCount: number;
}

export default function InvestmentOptionsSection({
  project,
  investorCount
}: InvestmentOptionsSectionProps) {
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(500);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const progressPercentage = (project.raised / project.target) * 100;
  const minInvestment = 100;
  const maxInvestment = 10000;
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvestmentAmount(parseInt(e.target.value));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      if (value < minInvestment) {
        setInvestmentAmount(minInvestment);
      } else if (value > maxInvestment) {
        setInvestmentAmount(maxInvestment);
      } else {
        setInvestmentAmount(value);
      }
    }
  };
  
  const toggleEditMode = () => {
    setIsEditingAmount(!isEditingAmount);
  };
  
  const handleInvest = () => {
    setShowConfirmation(true);
  };
  
  const confirmInvestment = () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Investissement réussi !",
        description: `Vous avez investi ${investmentAmount}€ dans ${project.name}.`,
      });
      
      setIsProcessing(false);
      setShowConfirmation(false);
      
      // Redirect to dashboard
      navigate("/dashboard");
    }, 2000);
  };
  
  const cancelInvestment = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-medium text-bgs-blue mb-4">Investir maintenant</h3>
      
      {!showConfirmation ? (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-bgs-blue/70">{progressPercentage.toFixed(0)}% financé</span>
              <span className="text-sm font-medium text-bgs-blue">{project.raised.toLocaleString()}€ / {project.target.toLocaleString()}€</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-bgs-blue/70">{investorCount} investisseurs</span>
              <span className="text-sm text-bgs-blue/70">Objectif: {project.target.toLocaleString()}€</span>
            </div>
            
            <div className="mb-4 bg-bgs-gray-light p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-bgs-blue">Montant d'investissement</span>
                <button 
                  onClick={toggleEditMode}
                  className="text-bgs-orange hover:text-bgs-orange-light transition-colors"
                >
                  {isEditingAmount ? <Save size={16} /> : <Edit size={16} />}
                </button>
              </div>
              
              {isEditingAmount ? (
                <input 
                  type="number"
                  value={investmentAmount}
                  onChange={handleInputChange}
                  min={minInvestment}
                  max={maxInvestment}
                  step={100}
                  className="w-full p-2 border border-bgs-blue/20 rounded bg-white focus:outline-none focus:ring-2 focus:ring-bgs-orange/50"
                />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-bgs-blue/70">100€</span>
                    <span className="text-xl font-bold text-bgs-blue">{investmentAmount}€</span>
                    <span className="text-sm text-bgs-blue/70">10 000€</span>
                  </div>
                  <input
                    type="range"
                    min={minInvestment}
                    max={maxInvestment}
                    step={100}
                    value={investmentAmount}
                    onChange={handleSliderChange}
                    className="w-full accent-bgs-orange"
                  />
                </>
              )}
            </div>
            
            <div className="bg-bgs-blue/5 p-3 rounded-lg mb-4">
              <div className="flex justify-between text-sm text-bgs-blue mb-1">
                <span>Rendement estimé</span>
                <span className="font-medium">{project.yield}%</span>
              </div>
              <div className="flex justify-between text-sm text-bgs-blue">
                <span>Durée</span>
                <span className="font-medium">{project.duration} ans</span>
              </div>
            </div>
          </div>
          
          <button onClick={handleInvest} className="w-full btn-primary flex items-center justify-center gap-2">
            Investir maintenant
            <ArrowRight size={18} />
          </button>
        </>
      ) : (
        <div className="animate-fade-in">
          <div className="mb-6 text-center">
            <h4 className="text-lg font-medium text-bgs-blue mb-2">Confirmation de votre investissement</h4>
            <p className="text-bgs-blue/70 mb-4">Veuillez vérifier les détails de votre investissement</p>
            
            <div className="bg-bgs-gray-light p-4 rounded-lg mb-4">
              <div className="mb-2">
                <p className="text-sm text-bgs-blue/70">Projet</p>
                <p className="font-medium text-bgs-blue">{project.name}</p>
              </div>
              <div className="mb-2">
                <p className="text-sm text-bgs-blue/70">Montant</p>
                <p className="font-medium text-bgs-blue">{investmentAmount}€</p>
              </div>
              <div className="mb-2">
                <p className="text-sm text-bgs-blue/70">Rendement estimé</p>
                <p className="font-medium text-bgs-blue">{project.yield}%</p>
              </div>
              <div className="mb-2">
                <p className="text-sm text-bgs-blue/70">Durée</p>
                <p className="font-medium text-bgs-blue">{project.duration} ans</p>
              </div>
            </div>
            
            <p className="text-sm text-bgs-blue/70 mb-4">
              En confirmant, vous acceptez d'investir {investmentAmount}€ dans ce projet.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={cancelInvestment}
              className="w-1/2 btn-secondary" 
              disabled={isProcessing}
            >
              Annuler
            </button>
            <button 
              onClick={confirmInvestment}
              className="w-1/2 btn-primary flex items-center justify-center gap-2" 
              disabled={isProcessing}
            >
              {isProcessing ? "Traitement en cours..." : "Confirmer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Project } from "@/types/project";
import { Slider } from "@/components/ui/slider";
import { Check, AlertCircle, Calculator, Calendar, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const firstPaymentDelay = project.firstPaymentDelayMonths || 1;
  
  const maxInvestment = project.maxInvestment || Math.min(project.price, 20000);
  
  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', session.session.user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUserBalance(data.wallet_balance || 0);
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    };
    
    fetchUserBalance();
    
    const profileChannel = supabase
      .channel('simulator_balance_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        console.log('Profile updated, refreshing user balance...');
        fetchUserBalance();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, []);
  
  useEffect(() => {
    const calculatedMonthlyReturn = investmentAmount * (project.yield / 100);
    const effectiveDuration = duration - firstPaymentDelay; 
    const calculatedTotalReturn = investmentAmount + (calculatedMonthlyReturn * Math.max(0, effectiveDuration));
    
    setTotalReturn(calculatedTotalReturn);
    setMonthlyReturn(calculatedMonthlyReturn);
  }, [investmentAmount, duration, project.yield, firstPaymentDelay]);
  
  const annualYieldPercentage = project.yield * 12;
  
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
          max={maxInvestment}
          step={100}
          onValueChange={(value) => setInvestmentAmount(value[0])}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-bgs-blue/60">
          <span>Min: {project.minInvestment} €</span>
          <span>Max: {maxInvestment.toLocaleString()} €</span>
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
      
      <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-100">
        <div className="flex items-start">
          <Clock className="h-4 w-4 text-amber-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700">Délai avant premier versement</p>
            <p className="text-xs text-amber-600 mt-1">
              Le premier versement sera effectué {firstPaymentDelay} mois après votre investissement.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-bgs-gray-light p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-bgs-blue mb-3">Simulation de rendement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Rendement mensuel</p>
            <div className="flex items-center text-green-600 font-bold">
              <TrendingUp className="h-4 w-4 mr-1" />
              {project.yield}% par mois
            </div>
          </div>
          <div>
            <p className="text-xs text-bgs-blue/70 mb-1">Rendement annuel</p>
            <div className="flex items-center text-green-600 font-bold">
              <TrendingUp className="h-4 w-4 mr-1" />
              {project.yield * 12}% par an
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
    </div>
  );
}

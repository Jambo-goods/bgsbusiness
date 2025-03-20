
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useInvestmentConfirmation } from "@/hooks/useInvestmentConfirmation";
import { toast } from "sonner";

interface InvestmentOptionsSectionProps {
  minInvestment: number;
  possibleDurations: number[];
  yield_rate: number;
  onInvestmentChange: (amount: number, duration: number) => void;
}

export default function InvestmentOptionsSection({
  minInvestment,
  possibleDurations,
  yield_rate,
  onInvestmentChange
}: InvestmentOptionsSectionProps) {
  const [amount, setAmount] = useState<number>(minInvestment);
  const [duration, setDuration] = useState<number>(possibleDurations[0]);
  const [isInputValid, setIsInputValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // After initial render, update the parent component with initial values
  useEffect(() => {
    onInvestmentChange(amount, duration);
  }, []);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    
    if (isNaN(value)) {
      setIsInputValid(false);
      setErrorMessage("Veuillez entrer un montant valide");
      return;
    }
    
    if (value < minInvestment) {
      setIsInputValid(false);
      setErrorMessage(`Le montant minimum est de ${minInvestment}€`);
    } else {
      setIsInputValid(true);
      setErrorMessage("");
      setAmount(value);
      onInvestmentChange(value, duration);
    }
  };
  
  const handleDurationChange = (value: string) => {
    const durationValue = parseInt(value);
    setDuration(durationValue);
    onInvestmentChange(amount, durationValue);
  };
  
  const calculateProjectedYield = () => {
    // Calculate monthly yield rate
    const monthlyYieldRate = yield_rate / 12 / 100;
    
    // Calculate total yield over the investment duration
    const totalYield = amount * monthlyYieldRate * duration;
    
    // Calculate total return (initial investment + total yield)
    const totalReturn = amount + totalYield;
    
    return {
      monthlyYield: (amount * monthlyYieldRate).toFixed(2),
      totalYield: totalYield.toFixed(2),
      totalReturn: totalReturn.toFixed(2)
    };
  };
  
  const yields = calculateProjectedYield();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Montant d'investissement</Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            defaultValue={minInvestment}
            onChange={handleAmountChange}
            min={minInvestment}
            className={!isInputValid ? "border-red-500" : ""}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500">€</span>
          </div>
        </div>
        {!isInputValid && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
        <p className="text-sm text-gray-500">
          Investissement minimum: {minInvestment}€
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Durée d'investissement</Label>
        <RadioGroup 
          defaultValue={possibleDurations[0].toString()} 
          onValueChange={handleDurationChange}
          className="flex flex-wrap gap-2"
        >
          {possibleDurations.map((months) => (
            <div key={months} className="flex items-center space-x-2">
              <RadioGroupItem value={months.toString()} id={`duration-${months}`} />
              <Label htmlFor={`duration-${months}`} className="cursor-pointer">
                {months} mois
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md space-y-3">
        <h3 className="font-medium">Projections de rendement</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-600">Rendement mensuel:</div>
          <div className="font-medium text-right">{yields.monthlyYield}€</div>
          
          <div className="text-gray-600">Rendement total:</div>
          <div className="font-medium text-right">{yields.totalYield}€</div>
          
          <div className="text-gray-600">Retour total:</div>
          <div className="font-medium text-right">{yields.totalReturn}€</div>
          
          <div className="text-gray-600">Taux de rendement:</div>
          <div className="font-medium text-right">{yield_rate}%</div>
        </div>
      </div>
      
      <div className="pt-2">
        <Button className="w-full group" onClick={() => onInvestmentChange(amount, duration)}>
          <span>Investir maintenant</span>
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Vous pouvez modifier ces options plus tard
        </p>
      </div>
    </div>
  );
}

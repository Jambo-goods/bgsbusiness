
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface InvestmentAmountSectionProps {
  investmentAmount: number;
  setInvestmentAmount: (amount: number) => void;
  minInvestment: number;
  maxInvestment: number;
}

export default function InvestmentAmountSection({
  investmentAmount,
  setInvestmentAmount,
  minInvestment,
  maxInvestment
}: InvestmentAmountSectionProps) {
  // Handlers for input and slider updates
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, ''));
    if (!isNaN(value)) {
      setInvestmentAmount(
        Math.min(Math.max(value, minInvestment), maxInvestment)
      );
    }
  };
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-bgs-blue">Montant à investir</label>
      
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input 
            type="text" 
            value={investmentAmount.toLocaleString()}
            onChange={handleInputChange}
            className="pr-8 font-medium text-right"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bgs-blue font-medium">
            €
          </span>
        </div>
      </div>
      
      <Slider
        value={[investmentAmount]}
        min={minInvestment}
        max={maxInvestment}
        step={100}
        onValueChange={(value) => setInvestmentAmount(value[0])}
      />
      
      <div className="flex justify-between text-xs text-bgs-blue/60">
        <span>Min: {minInvestment}€</span>
        <span>Max: {maxInvestment}€</span>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Edit, Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  
  useEffect(() => {
    // Set the investment amount to at least the minimum investment when component mounts
    if (investmentAmount < minInvestment) {
      setInvestmentAmount(minInvestment);
    }
  }, [minInvestment, investmentAmount, setInvestmentAmount]);
  
  const handleSliderChange = (values: number[]) => {
    setInvestmentAmount(values[0]);
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

  return (
    <div className="mb-4 bg-gradient-to-br from-white to-bgs-gray-light p-4 rounded-lg shadow-sm border border-gray-100">
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
        <div className="space-y-2">
          <Label htmlFor="investment-amount">Montant (€)</Label>
          <Input 
            id="investment-amount"
            type="number"
            value={investmentAmount}
            onChange={handleInputChange}
            min={minInvestment}
            max={maxInvestment}
            step={100}
            className="w-full p-2 border border-bgs-blue/20 rounded bg-white focus:outline-none focus:ring-2 focus:ring-bgs-orange/50"
          />
          <div className="text-xs text-bgs-blue/70 mt-1">
            Montant minimum: {minInvestment}€ | Maximum: {maxInvestment}€
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <span className="block text-center text-2xl font-bold text-gradient bg-gradient-to-r from-bgs-blue to-bgs-orange">{investmentAmount}€</span>
          </div>
          
          <div className="px-2 py-3">
            <Slider
              defaultValue={[investmentAmount]}
              max={maxInvestment}
              min={minInvestment}
              step={100}
              value={[investmentAmount]}
              onValueChange={handleSliderChange}
              className="my-4"
            />
            
            <div className="flex justify-between mt-3">
              <span className="text-sm text-bgs-blue/70">{minInvestment}€</span>
              <span className="text-sm text-bgs-blue/70">{maxInvestment}€</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

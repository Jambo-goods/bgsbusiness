
import React, { useState } from "react";
import { Edit, Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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
    <div className="mb-5 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-bgs-blue flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Montant d'investissement
        </span>
        <button 
          onClick={toggleEditMode}
          className="text-bgs-orange hover:text-bgs-orange-light transition-colors p-1 rounded-full hover:bg-bgs-orange/10"
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
          className="w-full p-3 border border-bgs-blue/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-bgs-orange/50 transition-shadow"
          autoFocus
        />
      ) : (
        <>
          <div className="mb-4">
            <span className="block text-center text-3xl font-bold text-gradient bg-gradient-to-r from-bgs-blue to-bgs-orange">{investmentAmount.toLocaleString()}€</span>
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
            
            <div className="flex justify-between mt-4">
              <span className="text-sm font-medium text-bgs-blue/70">{minInvestment.toLocaleString()}€</span>
              <span className="text-sm font-medium text-bgs-blue/70">{maxInvestment.toLocaleString()}€</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

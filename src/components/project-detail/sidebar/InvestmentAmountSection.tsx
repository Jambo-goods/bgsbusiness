
import React, { useState } from "react";
import { Edit, Save } from "lucide-react";

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

  return (
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
            <span className="text-sm text-bgs-blue/70">{minInvestment}€</span>
            <span className="text-xl font-bold text-bgs-blue">{investmentAmount}€</span>
            <span className="text-sm text-bgs-blue/70">{maxInvestment}€</span>
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
  );
}

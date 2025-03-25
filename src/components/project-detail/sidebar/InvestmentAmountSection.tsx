
import React from "react";
import { formatCurrency } from "@/utils/currencyUtils";

interface InvestmentAmountSectionProps {
  minInvestment: number;
  maxInvestment: number;
  investmentAmount: number;
  onChange: (amount: number) => void;
}

export default function InvestmentAmountSection({
  minInvestment,
  maxInvestment,
  investmentAmount,
  onChange
}: InvestmentAmountSectionProps) {
  // Generate quick amount options
  const quickAmounts = [
    minInvestment,
    Math.min(maxInvestment, minInvestment * 5),
    Math.min(maxInvestment, minInvestment * 10)
  ];
  
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    onChange(value);
  };
  
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-bgs-blue mb-2">Montant à investir</h4>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`py-2 px-3 text-sm rounded-md transition-colors ${
              investmentAmount === amount
                ? "bg-bgs-blue text-white"
                : "bg-white border border-bgs-gray-light text-bgs-blue hover:bg-bgs-gray-light"
            }`}
            onClick={() => onChange(amount)}
          >
            {formatCurrency(amount)}
          </button>
        ))}
      </div>
      
      <div className="relative">
        <input
          type="number"
          value={investmentAmount}
          onChange={handleManualInput}
          className="w-full px-4 py-2 border border-bgs-gray-light rounded-md focus:outline-none focus:ring-2 focus:ring-bgs-blue/30"
          min={minInvestment}
          max={maxInvestment}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bgs-blue">€</span>
      </div>
      
      <p className="text-xs text-bgs-blue/70 mt-1">
        Min: {formatCurrency(minInvestment)} • Max: {formatCurrency(maxInvestment)}
      </p>
    </div>
  );
}

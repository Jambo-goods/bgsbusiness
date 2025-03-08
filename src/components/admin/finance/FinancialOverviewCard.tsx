
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

type FinancialOverviewCardProps = {
  title: string;
  mainValue: number;
  previousValue?: number;
  format: 'currency' | 'percentage' | 'number';
  icon: React.ReactNode;
};

export function FinancialOverviewCard({ 
  title, 
  mainValue, 
  previousValue, 
  format, 
  icon 
}: FinancialOverviewCardProps) {
  
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return `${value.toLocaleString()} €`;
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };
  
  const getChangePercentage = () => {
    if (previousValue === undefined || previousValue === 0) return null;
    
    const change = ((mainValue - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };
  
  const changePercentage = getChangePercentage();
  const hasIncreased = changePercentage !== null && parseFloat(changePercentage) > 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-full">
            {icon}
          </div>
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        </div>
        
        {changePercentage !== null && (
          <div className={`flex items-center text-sm px-2 py-0.5 rounded ${
            hasIncreased ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
          }`}>
            {hasIncreased ? (
              <ArrowUp className="w-3 h-3 mr-1" />
            ) : (
              <ArrowDown className="w-3 h-3 mr-1" />
            )}
            {Math.abs(parseFloat(changePercentage))}%
          </div>
        )}
      </div>
      
      <p className="text-3xl font-bold">{formatValue(mainValue)}</p>
      
      {previousValue !== undefined && (
        <p className="text-sm text-gray-500 mt-1">
          Période précédente: {formatValue(previousValue)}
        </p>
      )}
    </div>
  );
}

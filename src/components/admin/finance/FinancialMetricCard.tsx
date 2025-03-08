
import React from 'react';

type FinancialMetricCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  format: 'currency' | 'percentage' | 'number';
};

export function FinancialMetricCard({ title, value, icon, format }: FinancialMetricCardProps) {
  const formatValue = () => {
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-50 rounded-full">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <p className="text-2xl font-bold">{formatValue()}</p>
    </div>
  );
}

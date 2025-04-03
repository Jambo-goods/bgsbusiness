
import React, { ReactNode } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: React.ReactNode;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  changePercentage?: string;
  changeValue?: string;
  changeTimeframe?: string;
  description?: string;
  valueClassName?: string;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  changePercentage,
  changeValue,
  changeTimeframe,
  description,
  valueClassName,
  onClick
}: DashboardCardProps) {
  const isPositiveChange = changePercentage && changePercentage.startsWith('+');
  const isNegativeChange = changePercentage && changePercentage.startsWith('-');
  const isNeutralChange = !isPositiveChange && !isNegativeChange;
  
  const cardClasses = cn(
    "bg-white rounded-lg border border-gray-100 p-4 shadow-sm transition-transform duration-200",
    onClick && "cursor-pointer hover:shadow-md hover:-translate-y-1"
  );
  
  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-bgs-gray-medium font-medium mb-1">
            {title}
          </h3>
          <div className={cn("text-xl font-semibold", valueClassName)}>
            {value}
          </div>
          
          {(changePercentage || changeValue) && (
            <div className="flex items-center mt-2 text-xs">
              <span 
                className={cn(
                  "flex items-center font-medium",
                  isPositiveChange && "text-green-600",
                  isNegativeChange && "text-red-600",
                  isNeutralChange && "text-yellow-600"
                )}
              >
                {isPositiveChange && <ArrowUpIcon className="h-3 w-3 mr-1" />}
                {isNegativeChange && <ArrowDownIcon className="h-3 w-3 mr-1" />}
                {changePercentage}
                
                {changeValue && <span className="ml-0.5">({changeValue})</span>}
              </span>
              
              {changeTimeframe && (
                <span className="text-bgs-gray-medium ml-1.5">
                  {changeTimeframe}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={cn("p-2 rounded-lg", iconBgColor)}>
          <div className={cn("w-8 h-8 flex items-center justify-center", iconColor)}>
            {icon}
          </div>
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-bgs-gray-medium mt-2"></p>
      )}
    </div>
  );
}

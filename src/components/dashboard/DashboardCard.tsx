
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  changePercentage?: string;
  changeValue?: string;
  changeTimeframe?: string;
  changeDirection?: "up" | "down" | "neutral";
  footer?: ReactNode;
  description?: string;
}

export default function DashboardCard({
  title,
  value,
  icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  changePercentage,
  changeValue,
  changeTimeframe = "ce mois",
  changeDirection,
  footer,
  description
}: DashboardCardProps) {
  // Determine change direction and color
  let direction = changeDirection;
  if (!direction && changePercentage) {
    direction = changePercentage.startsWith("-") ? "down" : changePercentage === "0%" ? "neutral" : "up";
  }
  
  const changeColor = 
    direction === "up" ? "text-green-600" : 
    direction === "down" ? "text-red-600" : 
    "text-gray-500";

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && (
          <div className={cn("p-2 rounded-full", iconBgColor)}>
            <div className={cn("w-4 h-4", iconColor)}>
              {icon}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-bgs-blue mb-2">
        {value}
      </div>
      
      {description && (
        <div className="text-sm text-gray-500 mb-2">
          {description}
        </div>
      )}
      
      {changePercentage && (
        <div className="flex items-center text-xs space-x-1">
          <span className={changeColor}>
            {changePercentage}
          </span>
          {changeValue && (
            <span className="text-gray-400">
              ({changeValue})
            </span>
          )}
          {changeTimeframe && (
            <span className="text-gray-400">
              {changeTimeframe}
            </span>
          )}
        </div>
      )}
      
      {footer && (
        <div className="mt-auto pt-3 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}


import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  changePercentage?: string;
  changeValue?: string;
  changeTimeframe?: string;
  description?: string;
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
}: DashboardCardProps) {
  // Determine if change is positive based on the actual data
  const isPositive = changePercentage ? 
    changePercentage.startsWith('+') || (changeValue && changeValue.startsWith('↑')) : 
    false;
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
      <div className="flex items-center justify-between mb-3">
        <div className={`${iconBgColor} p-2.5 rounded-lg`}>
          <div className={`h-5 w-5 ${iconColor}`}>{icon}</div>
        </div>
        {changePercentage && (
          <span className={`${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} text-xs px-2.5 py-1 rounded-full font-medium flex items-center`}>
            {isPositive ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            )}
            {changePercentage}
          </span>
        )}
      </div>
      <h3 className="text-xs font-medium text-bgs-gray-medium mb-1">
        {title}
      </h3>
      <p className="text-xl font-bold text-bgs-blue">
        {value}
      </p>
      {description && (
        <p className="text-xs text-green-600 font-medium mt-1">{description}</p>
      )}
      {changeValue && changeTimeframe && (
        <div className="mt-2 text-xs text-bgs-gray-medium">
          <span className={isPositive ? "text-green-500 font-medium" : "text-red-500 font-medium"}>{changeValue}</span> depuis <span className="font-medium">{changeTimeframe}</span>
        </div>
      )}
    </div>
  );
}

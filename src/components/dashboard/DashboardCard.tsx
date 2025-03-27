
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number | ReactNode;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  changePercentage?: string;
  changeValue?: string;
  changeTimeframe?: string;
  description?: string;
  footer?: ReactNode;
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
  footer
}: DashboardCardProps) {
  // Determine if change is positive based on the actual data
  const isPositive = changePercentage ? changePercentage.startsWith('+') || changeValue && changeValue.startsWith('↑') : false;
  
  // Don't show the change information if it's "0%", "0", or not provided
  const showChange = changePercentage && 
                    changePercentage !== "0%" && 
                    changePercentage !== "0" &&
                    changeValue !== "0" &&
                    changeValue !== "0€";
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-lg", iconBgColor)}>
          <div className={cn("h-5 w-5", iconColor)}>{icon}</div>
        </div>
        {showChange && (
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-full font-medium flex items-center",
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          )}>
            {isPositive ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            )}
            {changePercentage}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-bgs-gray-medium mb-2">
        {title}
      </h3>
      <div className="text-2xl font-bold text-bgs-blue mb-1">
        {value}
      </div>
      {description && (
        <p className="text-xs text-bgs-gray-medium mt-2">{description}</p>
      )}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}


import { ArrowUpIcon } from "lucide-react";
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
}: DashboardCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`${iconBgColor} p-2 rounded-lg`}>
          <div className={`h-5 w-5 ${iconColor}`}>{icon}</div>
        </div>
        {changePercentage && (
          <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-medium flex items-center">
            <ArrowUpIcon className="h-3 w-3 mr-1" /> {changePercentage}
          </span>
        )}
      </div>
      <h3 className="text-xs font-medium text-bgs-gray-medium mb-1">
        {title}
      </h3>
      <p className="text-xl font-bold text-bgs-blue">
        {value}
      </p>
      {changeValue && changeTimeframe && (
        <div className="mt-2 text-xs text-bgs-gray-medium">
          <span className="text-green-500">{changeValue}</span> depuis {changeTimeframe}
        </div>
      )}
    </div>
  );
}

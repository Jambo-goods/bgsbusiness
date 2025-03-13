
import { TrendingUpIcon } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { YieldChange } from "@/hooks/dashboard/types";

interface AverageYieldCardProps {
  monthlyYield: number;
  annualYield: number;
  yieldChange: YieldChange;
}

export default function AverageYieldCard({ 
  monthlyYield = 0, 
  annualYield = 0, 
  yieldChange 
}: AverageYieldCardProps) {
  // Always display 12% as the monthly yield value to match ReturnProjectionSection
  const fixedYieldPercentage = 12;
  
  return (
    <DashboardCard
      title="Rendement mensuel moyen"
      value={`${fixedYieldPercentage}%`}
      icon={<TrendingUpIcon />}
      iconBgColor="bg-green-100"
      iconColor="text-green-600"
      changePercentage={yieldChange.value || "0%"}
      changeValue={yieldChange.value || "0%"}
      changeTimeframe="le dernier mois"
      description={`${fixedYieldPercentage * 12}% annualisé`}
    />
  );
}


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
  // Calculate based on investments - using the value from props instead of hardcoding
  const monthlyYieldPercentage = monthlyYield;
  
  return (
    <DashboardCard
      title="Rendement mensuel moyen"
      value={`${monthlyYieldPercentage}%`}
      icon={<TrendingUpIcon />}
      iconBgColor="bg-green-100"
      iconColor="text-green-600"
      changePercentage={yieldChange.value || "0%"}
      changeValue={yieldChange.value || "0%"}
      changeTimeframe="le dernier mois"
      description={`${monthlyYieldPercentage * 12}% annualisé`}
    />
  );
}

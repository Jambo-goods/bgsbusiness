
import { TrendingUpIcon } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { YieldChange } from "@/hooks/dashboard/types";

interface AverageYieldCardProps {
  monthlyYield: number;
  annualYield: number;
  yieldChange: YieldChange;
}

export default function AverageYieldCard({ monthlyYield, annualYield, yieldChange }: AverageYieldCardProps) {
  return (
    <DashboardCard
      title="Rendement mensuel moyen"
      value={`${monthlyYield}%`}
      icon={<TrendingUpIcon />}
      iconBgColor="bg-green-100"
      iconColor="text-green-600"
      changePercentage={yieldChange.value}
      changeValue={yieldChange.value}
      changeTimeframe="le dernier mois"
      description={`${annualYield.toFixed(1)}% annualisé`}
    />
  );
}

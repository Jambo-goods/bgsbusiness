
import { WalletIcon } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { InvestmentChange } from "@/hooks/useDashboardCardData";

interface InvestmentTotalCardProps {
  investmentTotal: number;
  investmentChange: InvestmentChange;
}

export default function InvestmentTotalCard({ investmentTotal, investmentChange }: InvestmentTotalCardProps) {
  return (
    <DashboardCard
      title="Total investi"
      value={`${investmentTotal.toLocaleString()} €`}
      icon={<WalletIcon />}
      iconBgColor="bg-blue-100"
      iconColor="text-bgs-blue"
      changePercentage={investmentChange.percentage}
      changeValue={investmentChange.value}
      changeTimeframe="le dernier mois"
    />
  );
}

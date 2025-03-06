
import { WalletIcon } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { InvestmentChange } from "@/hooks/dashboard/types";

interface InvestmentTotalCardProps {
  investmentTotal: number;
  investmentChange: InvestmentChange;
}

export default function InvestmentTotalCard({ 
  investmentTotal = 0, 
  investmentChange 
}: InvestmentTotalCardProps) {
  return (
    <DashboardCard
      title="Total investi"
      value={`${investmentTotal.toLocaleString()} €`}
      icon={<WalletIcon />}
      iconBgColor="bg-blue-100"
      iconColor="text-bgs-blue"
      changePercentage={investmentChange.percentage || "0%"}
      changeValue={investmentChange.value || "0€"}
      changeTimeframe="le dernier mois"
    />
  );
}

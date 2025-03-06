
import { Banknote } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { WalletChange } from "@/hooks/dashboard/types";

interface WalletBalanceCardProps {
  walletBalance?: number;
  walletChange: WalletChange;
}

export default function WalletBalanceCard({ walletBalance, walletChange }: WalletBalanceCardProps) {
  return (
    <DashboardCard
      title="Solde disponible"
      value={`${walletBalance?.toLocaleString() || "0"} €`}
      icon={<Banknote />}
      iconBgColor="bg-purple-100"
      iconColor="text-purple-600"
      changePercentage={walletChange.percentage}
      changeValue={walletChange.value}
      changeTimeframe="le dernier mois"
    />
  );
}

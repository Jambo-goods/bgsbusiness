
import { Banknote } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { WalletChange } from "@/hooks/dashboard/types";

interface WalletBalanceCardProps {
  walletBalance?: number;
  walletChange: WalletChange;
}

export default function WalletBalanceCard({ walletBalance = 0, walletChange }: WalletBalanceCardProps) {
  return (
    <DashboardCard
      title="Solde disponible"
      value={`${walletBalance?.toLocaleString() || "0"} €`}
      icon={<Banknote />}
      iconBgColor="bg-purple-100"
      iconColor="text-purple-600"
      changePercentage={walletChange.percentage || "0%"}
      changeValue={walletChange.value || "0€"}
      changeTimeframe="le dernier mois"
      description="Méthode : Virement bancaire"
    />
  );
}

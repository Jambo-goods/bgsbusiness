
import { Banknote } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { WalletChange } from "@/hooks/dashboard/types";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletBalanceCardProps {
  walletBalance?: number;
  walletChange: WalletChange;
  isLoading?: boolean;
}

export default function WalletBalanceCard({ 
  walletBalance = 0, 
  walletChange, 
  isLoading = false 
}: WalletBalanceCardProps) {
  return (
    <DashboardCard
      title="Solde disponible"
      value={isLoading ? (
        <Skeleton className="h-8 w-24 bg-gray-200" />
      ) : (
        `${walletBalance.toLocaleString() || "0"} €`
      )}
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

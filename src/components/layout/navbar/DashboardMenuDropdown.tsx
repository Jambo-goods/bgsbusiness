
import { WalletCards } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/currencyUtils";

export default function DashboardMenuDropdown() {
  const { walletBalance, isLoadingBalance } = useWalletBalance();
  
  return (
    <div>
      <button
        className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Afficher le solde du portefeuille"
      >
        <WalletCards className="h-5 w-5 text-gray-700" />
        {isLoadingBalance ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {formatCurrency(walletBalance)}
          </span>
        )}
      </button>
    </div>
  );
}

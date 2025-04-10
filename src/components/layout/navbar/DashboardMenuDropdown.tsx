
import { WalletCards } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function DashboardMenuDropdown() {
  const { walletBalance, isLoadingBalance } = useWalletBalance();
  
  return (
    <div className="relative">
      <button
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200",
          "bg-white border border-gray-100 shadow-sm hover:shadow-md",
          "text-bgs-blue hover:bg-gray-50"
        )}
        aria-label="Solde du portefeuille"
      >
        <WalletCards className="h-5 w-5 text-bgs-blue" />
        {isLoadingBalance ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <span className="text-sm font-medium">{walletBalance.toLocaleString('fr-FR')} €</span>
        )}
      </button>
    </div>
  );
}


import { useState } from "react";
import { WalletCards } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardMenuDropdown() {
  const { walletBalance, isLoadingBalance } = useWalletBalance();
  
  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        <WalletCards className="h-5 w-5 text-gray-700" />
        {isLoadingBalance ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <span className="text-sm font-medium text-gray-700">{walletBalance} €</span>
        )}
      </button>
    </div>
  );
}

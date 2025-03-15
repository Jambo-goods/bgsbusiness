
import React from "react";
import { RefreshCcw } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletCard() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-bgs-blue">Solde disponible</h3>
          <button 
            onClick={refreshBalance} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Rafraîchir le solde"
          >
            <RefreshCcw className="h-4 w-4 text-bgs-blue" />
          </button>
        </div>
        
        {isLoadingBalance ? (
          <Skeleton className="h-10 w-32 mt-2" />
        ) : (
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-bgs-blue">
              {walletBalance.toLocaleString('fr-FR')}
            </span>
            <span className="ml-1 text-xl text-bgs-blue">€</span>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mt-4">
          Votre solde est mis à jour automatiquement lorsque vos virements sont confirmés.
        </p>
      </CardContent>
    </Card>
  );
}

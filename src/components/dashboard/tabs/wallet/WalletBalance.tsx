
import React from "react";
import { WalletCards, Euro, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletBalanceProps {
  balance: number;
  isLoading?: boolean;
}

export default function WalletBalance({ balance, isLoading = false }: WalletBalanceProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg">
            <WalletCards className="h-5 w-5 text-bgs-blue" />
          </div>
          <h2 className="text-lg font-semibold text-bgs-blue">Solde disponible</h2>
        </div>
        <div className="bg-green-50 px-2 py-1 rounded-lg flex items-center">
          <TrendingUp className="h-3.5 w-3.5 text-green-500 mr-1" />
          <span className="text-xs font-medium text-green-600">+2.4%</span>
        </div>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-9 w-32 mb-4" />
      ) : (
        <div className="flex items-center gap-1 mb-4">
          <Euro className="h-7 w-7 text-bgs-blue opacity-80" />
          <span className="text-3xl font-bold text-bgs-blue bg-gradient-to-r from-bgs-blue to-blue-500 bg-clip-text text-transparent">
            {balance.toLocaleString('fr-FR')}
          </span>
          <span className="text-3xl font-bold text-bgs-blue">€</span>
        </div>
      )}
      
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-bgs-gray-medium mb-4">
          Votre solde disponible peut être utilisé pour investir dans de nouveaux projets ou être retiré sur votre compte bancaire.
        </p>
        <div className="flex justify-between items-center">
          <button className="text-bgs-blue hover:text-bgs-blue-light text-sm font-medium transition-colors">
            Ajouter des fonds
          </button>
          <button className="text-bgs-orange hover:text-bgs-orange-light text-sm font-medium transition-colors">
            Effectuer un retrait
          </button>
        </div>
      </div>
    </div>
  );
}

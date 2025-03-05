
import React from "react";
import { Wallet, TrendingUp, Loader2 } from "lucide-react";

interface WalletBalanceProps {
  balance: number;
  isLoading?: boolean;
}

export default function WalletBalance({ balance, isLoading = false }: WalletBalanceProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-bgs-blue" />
        <h2 className="text-lg font-semibold text-bgs-blue">Solde du portefeuille</h2>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 text-bgs-blue animate-spin" />
              <span className="text-bgs-gray-medium">Chargement...</span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-gradient bg-gradient-to-r from-bgs-blue to-bgs-orange">
              {balance} €
            </p>
          )}
          <p className="text-sm text-bgs-gray-medium mt-1">
            Solde disponible pour investir
          </p>
        </div>
        
        <div className="bg-green-100 p-2 rounded-lg">
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      </div>
    </div>
  );
}

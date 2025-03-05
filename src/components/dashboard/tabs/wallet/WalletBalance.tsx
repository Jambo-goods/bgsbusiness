
import React from "react";
import { WalletCards, Euro } from "lucide-react";

interface WalletBalanceProps {
  balance: number;
}

export default function WalletBalance({ balance }: WalletBalanceProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-2">
        <WalletCards className="h-5 w-5 text-bgs-blue" />
        <h2 className="text-lg font-semibold text-bgs-blue">Solde disponible</h2>
      </div>
      <div className="flex items-center text-3xl font-bold text-bgs-blue mb-4">
        <Euro className="h-6 w-6 mr-1 text-bgs-blue" />
        {balance.toLocaleString('fr-FR')} €
      </div>
      <p className="text-sm text-bgs-gray-medium mb-4">
        Votre solde disponible peut être utilisé pour investir dans de nouveaux projets ou être retiré sur votre compte bancaire.
      </p>
    </div>
  );
}

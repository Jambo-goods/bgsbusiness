
import React from "react";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface WalletCardProps {
  balance: number;
}

export const WalletCard = ({ balance }: WalletCardProps) => {
  // Format balance with euro symbol and thousands separator
  const formattedBalance = new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(balance);

  return (
    <Card className="p-4 shadow-sm bg-white">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Wallet className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Solde portefeuille</p>
          <p className="text-2xl font-semibold text-gray-900">{formattedBalance}</p>
        </div>
      </div>
    </Card>
  );
};

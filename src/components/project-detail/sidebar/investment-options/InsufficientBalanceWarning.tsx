
import React from "react";
import { AlertCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InsufficientBalanceWarningProps {
  walletBalance: number;
  selectedAmount: number;
}

export default function InsufficientBalanceWarning({
  walletBalance,
  selectedAmount
}: InsufficientBalanceWarningProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-start gap-2 text-red-600 mb-4 p-3 bg-red-50 rounded-md">
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold">Solde insuffisant pour investir</p>
        <p className="mt-1">Vous avez actuellement {walletBalance}€ dans votre portefeuille.</p>
        <p className="mt-1 font-medium">Montant manquant: {selectedAmount - walletBalance}€</p>
        <Button 
          variant="link" 
          className="p-0 h-auto text-red-600 hover:text-red-800 mt-2 flex items-center gap-1.5" 
          onClick={() => navigate("/dashboard/wallet?action=deposit")}
        >
          <Wallet className="h-4 w-4" />
          Effectuer un dépôt maintenant
        </Button>
      </div>
    </div>
  );
}

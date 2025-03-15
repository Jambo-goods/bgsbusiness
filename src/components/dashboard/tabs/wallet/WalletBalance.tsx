
import React from "react";
import { WalletCards, RefreshCw, CalculatorIcon, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WalletBalanceProps {
  balance: number;
  isLoading?: boolean;
  onTabChange?: (tab: string) => void;
  onRefresh?: () => void;
  onRecalculate?: () => void;
}

export default function WalletBalance({
  balance,
  isLoading = false,
  onTabChange,
  onRefresh,
  onRecalculate
}: WalletBalanceProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg">
            <WalletCards className="h-5 w-5 text-bgs-blue" />
          </div>
          <h2 className="text-lg font-semibold text-bgs-blue">Solde disponible</h2>
        </div>
        <div className="flex items-center gap-2">
          {onRecalculate && (
            <Button 
              onClick={onRecalculate}
              variant="outline"
              size="sm"
              className="text-bgs-blue hover:text-bgs-blue-dark hover:bg-blue-50"
              aria-label="Recalculer le solde"
            >
              <CalculatorIcon className="h-4 w-4 mr-1" />
              Recalculer
            </Button>
          )}
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="text-bgs-blue hover:text-bgs-blue-dark p-2 rounded-full hover:bg-gray-50"
              aria-label="Rafraîchir"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-9 w-32 mb-4" />
      ) : (
        <div className="flex items-center text-3xl font-bold text-bgs-blue mb-4">
          {balance.toLocaleString('fr-FR')} €
        </div>
      )}
      
      {balance === 0 && !isLoading && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Votre solde est à zéro. Si vous avez effectué des dépôts, cliquez sur "Recalculer" pour mettre à jour votre solde.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm text-bgs-gray-medium mb-4">
          Votre solde disponible peut être utilisé pour investir dans de nouveaux projets ou être retiré sur votre compte bancaire.
        </p>
        <div className="flex justify-between items-center">
          <button 
            className="text-bgs-blue hover:text-bgs-blue-light text-sm font-medium transition-colors" 
            onClick={() => onTabChange && onTabChange('deposit')}
          >
            Ajouter des fonds
          </button>
          <button 
            className="text-bgs-orange hover:text-bgs-orange-light text-sm font-medium transition-colors" 
            onClick={() => onTabChange && onTabChange('withdraw')}
          >
            Effectuer un retrait
          </button>
        </div>
      </div>
    </div>
  );
}

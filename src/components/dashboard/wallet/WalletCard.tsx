
import React from "react";
import { RefreshCcw, CalculatorIcon } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function WalletCard() {
  const { walletBalance, isLoadingBalance, refreshBalance, recalculateBalance } = useWalletBalance();

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-bgs-blue">Solde disponible</h3>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={refreshBalance} 
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Rafraîchir le solde"
                    disabled={isLoadingBalance}
                  >
                    <RefreshCcw className={`h-4 w-4 text-bgs-blue ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rafraîchir le solde</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={recalculateBalance} 
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Recalculer le solde"
                    disabled={isLoadingBalance}
                  >
                    <CalculatorIcon className={`h-4 w-4 text-bgs-blue ${isLoadingBalance ? 'animate-spin' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Recalculer le solde</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {isLoadingBalance ? (
          <Skeleton className="h-10 w-32 mt-2" />
        ) : (
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${walletBalance < 0 ? 'text-red-500' : 'text-bgs-blue'}`}>
              {walletBalance.toLocaleString('fr-FR')}
            </span>
            <span className={`ml-1 text-xl ${walletBalance < 0 ? 'text-red-500' : 'text-bgs-blue'}`}>€</span>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mt-4">
          Votre solde est mis à jour automatiquement lorsque vos virements sont confirmés et vos retraits approuvés.
        </p>
      </CardContent>
    </Card>
  );
}

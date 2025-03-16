
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function WalletCard() {
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  const navigate = useNavigate();
  
  const handleDepositClick = () => {
    navigate("/dashboard/wallet", { state: { activeTab: "deposit" } });
  };
  
  const handleWithdrawClick = () => {
    navigate("/dashboard/wallet", { state: { activeTab: "withdraw" } });
  };
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-bgs-blue to-bgs-blue-light text-white">
        <CardTitle className="flex justify-between items-center">
          <span>Votre portefeuille</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshBalance}
            disabled={isLoadingBalance}
            className="h-8 w-8 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
            <span className="sr-only">Actualiser</span>
          </Button>
        </CardTitle>
        <CardDescription className="text-white/90">
          Gérez vos fonds disponibles
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoadingBalance ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="text-center">
            <div className="text-3xl font-bold text-bgs-blue">{walletBalance.toLocaleString('fr-FR')} €</div>
            <p className="text-muted-foreground mt-2">Solde disponible</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" size="sm" className="w-full" onClick={handleDepositClick}>
          Déposer des fonds
        </Button>
        <Button variant="outline" size="sm" className="w-full" onClick={handleWithdrawClick}>
          Retirer des fonds
        </Button>
      </CardFooter>
    </Card>
  );
}

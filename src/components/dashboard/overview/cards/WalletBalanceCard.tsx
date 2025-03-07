
import { Banknote } from "lucide-react";
import DashboardCard from "../../DashboardCard";
import { WalletChange } from "@/hooks/dashboard/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WalletBalanceCardProps {
  walletBalance?: number;
  walletChange: WalletChange;
}

export default function WalletBalanceCard({ walletBalance = 0, walletChange }: WalletBalanceCardProps) {
  const navigate = useNavigate();

  return (
    <DashboardCard
      title="Solde disponible"
      value={`${walletBalance?.toLocaleString() || "0"} €`}
      icon={<Banknote />}
      iconBgColor="bg-purple-100"
      iconColor="text-purple-600"
      changePercentage={walletChange.percentage || "0%"}
      changeValue={walletChange.value || "0€"}
      changeTimeframe="le dernier mois"
      footer={
        <div className="mt-2 space-y-2 text-xs text-gray-500">
          <div className="font-medium text-bgs-blue">💰 Dépôt & Retrait d'Argent</div>
          <div>Méthode de paiement et retrait : Virement bancaire</div>
          <div>✅ Dépôt minimum : 100€</div>
          <div>✅ Retrait possible après un délai défini</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 text-xs"
            onClick={() => navigate('/dashboard/wallet')}
          >
            Gérer mon portefeuille
          </Button>
        </div>
      }
    />
  );
}

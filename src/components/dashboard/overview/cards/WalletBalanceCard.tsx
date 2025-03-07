
import { Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../../DashboardCard";
import { Button } from "@/components/ui/button";
import { WalletChange } from "@/hooks/dashboard/types";

interface WalletBalanceCardProps {
  walletBalance?: number;
  walletChange: WalletChange;
}

export default function WalletBalanceCard({ walletBalance = 0, walletChange }: WalletBalanceCardProps) {
  const navigate = useNavigate();

  const handleManageWallet = () => {
    // Navigate to wallet tab in dashboard
    // Using state parameter to set the active tab
    navigate('/dashboard', { state: { activeTab: 'wallet' } });
  };

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
      description="Méthode : Virement bancaire"
      footer={
        <Button 
          onClick={handleManageWallet} 
          className="w-full mt-2 bg-bgs-blue hover:bg-bgs-blue-light text-white"
          size="sm"
        >
          Gérer mon portefeuille
        </Button>
      }
    />
  );
}

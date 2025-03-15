
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { WalletCard } from "./WalletCard";

export function WalletDisplay() {
  const { walletBalance, refreshBalance } = useWalletBalance();
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Votre portefeuille</h2>
      <WalletCard />
    </div>
  );
}

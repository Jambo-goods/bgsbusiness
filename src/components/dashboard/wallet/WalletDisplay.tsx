
import { WalletCard } from "./WalletCard";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export function WalletDisplay() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Votre portefeuille</h2>
        <button 
          onClick={handleRefresh} 
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>
      <WalletCard />
    </div>
  );
}

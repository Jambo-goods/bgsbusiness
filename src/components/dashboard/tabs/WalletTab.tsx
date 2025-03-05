
import React, { useState } from "react";
import { toast } from "sonner";
import WalletBalance from "./wallet/WalletBalance";
import ActionButtons from "./wallet/ActionButtons";
import WalletHistory from "./wallet/WalletHistory";

export default function WalletTab() {
  const [balance, setBalance] = useState(3250);

  const handleDeposit = () => {
    // This is a placeholder for actual deposit functionality
    toast.success("Cette fonctionnalité sera bientôt disponible");
  };

  const handleWithdraw = () => {
    // This is a placeholder for actual withdrawal functionality
    toast.info("Cette fonctionnalité sera bientôt disponible");
  };

  return (
    <div className="space-y-6">
      <WalletBalance balance={balance} />
      <ActionButtons onDeposit={handleDeposit} onWithdraw={handleWithdraw} />
      <WalletHistory />
    </div>
  );
}

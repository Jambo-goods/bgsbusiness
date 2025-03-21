
import React from "react";
import { WalletCard } from "./WalletCard";

export function WalletDisplay() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Votre portefeuille</h2>
      <WalletCard />
    </div>
  );
}

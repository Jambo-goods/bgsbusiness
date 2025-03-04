
import React from "react";

export default function WalletTab() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Solde disponible</h2>
      <div className="text-3xl font-bold text-bgs-blue mb-4">3,250 €</div>
      <p className="text-sm text-bgs-gray-medium mb-4">Votre solde disponible peut être utilisé pour investir dans de nouveaux projets ou être retiré sur votre compte bancaire.</p>
      <div className="flex space-x-4">
        <button className="btn-primary">Déposer des fonds</button>
        <button className="btn-secondary">Retirer des fonds</button>
      </div>
    </div>
  );
}

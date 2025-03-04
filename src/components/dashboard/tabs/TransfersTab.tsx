
import React from "react";

interface TransfersTabProps {
  userData: {
    firstName: string;
    lastName: string;
  };
}

export default function TransfersTab({ userData }: TransfersTabProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Dépôt et retrait par virement bancaire</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-5 rounded-lg">
          <h3 className="font-medium text-bgs-blue mb-3">Effectuer un dépôt</h3>
          <p className="text-sm text-bgs-gray-medium mb-4">
            Pour créditer votre compte, veuillez effectuer un virement vers notre compte bancaire en indiquant votre identifiant dans la référence.
          </p>
          <div className="bg-bgs-gray-light p-3 rounded-md text-sm mb-4">
            <div><span className="font-medium">IBAN:</span> FR76 3000 4000 0300 0000 0000 000</div>
            <div><span className="font-medium">BIC:</span> BNPAFRPP</div>
            <div><span className="font-medium">Référence:</span> BGS-{userData.firstName.toUpperCase()}{userData.lastName.toUpperCase()}</div>
          </div>
          <button className="btn-primary w-full">J'ai effectué le virement</button>
        </div>
        
        <div className="border p-5 rounded-lg">
          <h3 className="font-medium text-bgs-blue mb-3">Demander un retrait</h3>
          <p className="text-sm text-bgs-gray-medium mb-4">
            Vous pouvez demander un retrait de votre solde disponible vers votre compte bancaire. Les retraits sont traités sous 2 jours ouvrés.
          </p>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm text-bgs-gray-medium mb-1">Montant du retrait</label>
              <input 
                type="number" 
                placeholder="0.00 €" 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-bgs-gray-medium mb-1">IBAN</label>
              <input 
                type="text" 
                placeholder="FR76..." 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button className="btn-primary w-full">Demander le retrait</button>
        </div>
      </div>
    </div>
  );
}

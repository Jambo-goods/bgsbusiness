
import React from "react";

export default function HistoryTab() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <h2 className="text-lg font-semibold text-bgs-blue mb-4">Historique des transactions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-bgs-gray-medium uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-bgs-gray-light/50">
              <td className="px-4 py-3 text-sm text-bgs-blue">15/03/2023</td>
              <td className="px-4 py-3 text-sm text-bgs-blue">Investissement BGS Wood Africa</td>
              <td className="px-4 py-3 text-sm font-medium text-red-500">-2500 €</td>
              <td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">Complété</span></td>
            </tr>
            <tr className="hover:bg-bgs-gray-light/50">
              <td className="px-4 py-3 text-sm text-bgs-blue">10/03/2023</td>
              <td className="px-4 py-3 text-sm text-bgs-blue">Dépôt par virement</td>
              <td className="px-4 py-3 text-sm font-medium text-green-500">+3000 €</td>
              <td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">Complété</span></td>
            </tr>
            <tr className="hover:bg-bgs-gray-light/50">
              <td className="px-4 py-3 text-sm text-bgs-blue">01/03/2023</td>
              <td className="px-4 py-3 text-sm text-bgs-blue">Rendement mensuel BGS Logistics</td>
              <td className="px-4 py-3 text-sm font-medium text-green-500">+36 €</td>
              <td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">Complété</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

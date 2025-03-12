
import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { PaymentRecord } from './types';
import { Project } from '@/types/project';

interface ReturnProjectionSectionProps {
  paymentRecords: PaymentRecord[];
  cumulativeExpectedReturns: PaymentRecord[];
  isLoading: boolean;
  userInvestments: Project[];
}

const ReturnProjectionSection: React.FC<ReturnProjectionSectionProps> = ({
  paymentRecords,
  cumulativeExpectedReturns,
  isLoading,
  userInvestments
}) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter only future payments
  const futurePayments = cumulativeExpectedReturns.filter(payment => 
    payment.status === 'scheduled' || payment.status === 'pending'
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 p-2.5 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Projection des rendements</h2>
            <p className="text-xs text-gray-500 mt-0.5">Prévisions basées sur vos investissements actuels</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pourcentage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumul</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {futurePayments.length > 0 ? (
              futurePayments.map((payment, index) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {payment.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    {payment.projectName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {payment.percentage ? `${payment.percentage.toFixed(2)}%` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.amount.toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                    {payment.expectedCumulativeReturn ? payment.expectedCumulativeReturn.toFixed(2) : 0} €
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {payment.status === 'pending' ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    ) : payment.status === 'scheduled' ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Programmé
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {payment.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-sm text-center text-gray-500">
                  Aucune projection de rendement disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {userInvestments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Ces projections sont basées sur les taux de rendement actuels et peuvent varier. 
            Le premier versement est généralement effectué après la période de délai initiale spécifiée dans chaque projet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReturnProjectionSection;

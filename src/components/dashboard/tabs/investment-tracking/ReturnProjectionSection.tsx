import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { PaymentRecord } from './types';
import { Project } from '@/types/project';

interface ReturnProjectionSectionProps {
  paymentRecords: PaymentRecord[];
  cumulativeExpectedReturns: PaymentRecord[];
  isLoading: boolean;
  userInvestments: Project[];
}

const PaymentStatusBadge: React.FC<{
  status: string;
}> = ({
  status
}) => {
  switch (status) {
    case 'pending':
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          En attente
        </span>;
    case 'scheduled':
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          Programmé
        </span>;
    case 'paid':
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Payé
        </span>;
    default:
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {status}
        </span>;
  }
};

const ReturnProjectionSection: React.FC<ReturnProjectionSectionProps> = ({
  paymentRecords,
  cumulativeExpectedReturns,
  isLoading,
  userInvestments
}) => {
  const futurePayments = useMemo(() => {
    if (!cumulativeExpectedReturns || cumulativeExpectedReturns.length === 0) {
      return [];
    }
    
    const payments = cumulativeExpectedReturns
      .filter(payment => payment.status === 'scheduled' || payment.status === 'pending')
      .map(payment => {
        const originalDate = new Date(payment.date);
        const adjustedDate = new Date(originalDate.getFullYear(), originalDate.getMonth(), 5);

        if (originalDate.getDate() > 5 && payment.status === 'scheduled') {
          adjustedDate.setMonth(adjustedDate.getMonth() + 1);
        }
        return {
          ...payment,
          date: adjustedDate
        };
      });

    return payments.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [cumulativeExpectedReturns]);

  const stats = useMemo(() => {
    if (!paymentRecords || paymentRecords.length === 0) {
      return {
        totalReceived: 0,
        totalPending: 0,
        averageMonthlyReturn: 0,
        averageReturnPercentage: 12
      };
    }
    
    const totalReceived = paymentRecords.filter(payment => payment.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
    const totalPending = paymentRecords.filter(payment => payment.status === 'pending' || payment.status === 'scheduled').reduce((sum, payment) => sum + payment.amount, 0);
    const paidPayments = paymentRecords.filter(payment => payment.status === 'paid');
    const averageMonthlyReturn = paidPayments.length > 0 ? totalReceived / paidPayments.length : 0;
    const averageReturnPercentage = 12;

    return {
      totalReceived,
      totalPending,
      averageMonthlyReturn,
      averageReturnPercentage
    };
  }, [paymentRecords]);

  if (!paymentRecords || paymentRecords.length === 0 || isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2.5 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Rendement mensuel</h2>
              <p className="text-xs text-gray-500 mt-0.5">Basées sur vos investissements actuels</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {userInvestments && userInvestments.length > 0 ? (
              userInvestments.map((investment, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-600">{investment.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{investment.companyName}</p>
                      
                      <div className="flex items-center mt-4 text-sm">
                        <div className="mr-4">
                          <p className="text-gray-500">Montant investi</p>
                          <p className="font-semibold">{investment.investedAmount}€</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rendement annuel</p>
                          <p className="font-semibold text-green-600">{investment.yield}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        {investment.status === 'active' ? 'Actif' : 
                         investment.status === 'completed' ? 'Terminé' : 'À venir'}
                      </span>
                      
                      <div className="mt-auto pt-4">
                        <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                          Détails <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-blue-50 p-3 rounded-full mb-4">
                  <AlertCircle className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun investissement actif</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Vous n'avez pas encore d'investissements actifs. Explorez nos opportunités pour commencer à investir.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4">
            <h3 className="font-medium text-gray-700 mb-2">Rendement estimé</h3>
            <p className="text-sm text-gray-600">
              Les investissements actifs génèrent un rendement annuel moyen de 12%, avec des versements mensuels.
              Votre premier versement est généralement effectué après la période de délai initiale spécifiée dans chaque projet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fixedPercentage = 12;
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-50 p-2.5 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Rendement mensuel</h2>
            <p className="text-xs text-gray-500 mt-0.5">Basées sur vos investissements actuels</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center mb-2">
            <div className="bg-green-100 p-1.5 rounded-full mr-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-green-700">Total des versements perçus</p>
          </div>
          <p className="text-lg font-medium text-green-700">{stats.totalReceived.toFixed(2)} €</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center mb-2">
            <div className="bg-yellow-100 p-1.5 rounded-full mr-2">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <p className="text-xs text-yellow-700">Total des versements en attente</p>
          </div>
          <p className="text-lg font-medium text-yellow-700">{stats.totalPending.toFixed(2)} €</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-1.5 rounded-full mr-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-blue-700">Rendement mensuel moyen</p>
          </div>
          <p className="text-lg font-medium text-blue-700">{stats.averageReturnPercentage}%</p>
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
            {futurePayments && futurePayments.length > 0 ? futurePayments.map(payment => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {payment.date.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                  {payment.projectName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {fixedPercentage}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.amount.toFixed(2)} €
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  {payment.expectedCumulativeReturn ? payment.expectedCumulativeReturn.toFixed(2) : 0} €
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <PaymentStatusBadge status={payment.status} />
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-sm text-center text-gray-500">
                  Aucune projection de rendement disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {userInvestments && userInvestments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <strong>Note:</strong> Ces projections sont basées sur les taux de rendement actuels et peuvent varier. 
            Le premier versement est généralement effectué après la période de délai initiale spécifiée dans chaque projet. 
            Les versements suivants sont effectués le 5 de chaque mois.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReturnProjectionSection;

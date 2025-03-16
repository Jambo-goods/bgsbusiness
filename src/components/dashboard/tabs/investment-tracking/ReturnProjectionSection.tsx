
import React, { useMemo } from 'react';
import { TrendingUp, CheckCircle, Clock, AlertCircle, ChevronRight, Calendar, DollarSign, BarChart3, PercentIcon } from 'lucide-react';
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

  const totalInvestedAmount = useMemo(() => {
    return userInvestments.reduce((sum, project) => {
      return sum + (project.investedAmount || 0);
    }, 0);
  }, [userInvestments]);

  const projectedReturns = useMemo(() => {
    if (!userInvestments || userInvestments.length === 0) {
      return [];
    }
    
    // Calculate cumulative returns over 12 months
    const projections = [];
    let cumulativeReturn = 0;
    
    for (let month = 1; month <= 12; month++) {
      const monthlyReturn = userInvestments.reduce((sum, project) => {
        const monthlyYield = project.yield / 100;
        const monthlyAmount = (project.investedAmount || 0) * monthlyYield;
        return sum + monthlyAmount;
      }, 0);
      
      cumulativeReturn += monthlyReturn;
      
      projections.push({
        month,
        monthlyReturn,
        cumulativeReturn
      });
    }
    
    return projections;
  }, [userInvestments]);

  if (!paymentRecords || paymentRecords.length === 0 || isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-2.5 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Projection de rendement</h2>
              <p className="text-xs text-gray-500 mt-0.5">Basée sur vos investissements actuels</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Vos projections de rendement</h3>
            <p className="text-sm text-gray-600">
              Visualisez vos rendements futurs basés sur vos investissements actuels. Ces projections sont calculées avec un taux de rendement moyen de 12% par an.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {userInvestments && userInvestments.length > 0 ? (
              userInvestments.map((investment, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-600">{investment.name}</h4>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {investment.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-xs text-gray-500 mb-1">Investi</p>
                      <p className="font-medium">{investment.investedAmount || 0} €</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs text-gray-500 mb-1">Rendement</p>
                      <p className="font-medium text-green-600">{investment.yield}%</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Revenu mensuel</p>
                      <p className="text-sm font-medium text-green-600">
                        {((investment.investedAmount || 0) * (investment.yield / 100)).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-center">
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
          
          {userInvestments && userInvestments.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-5 mb-6">
              <div className="flex items-start md:items-center flex-col md:flex-row justify-between mb-4">
                <div className="flex items-center gap-3 mb-3 md:mb-0">
                  <div className="bg-white p-2 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">Projections sur 12 mois</h3>
                    <p className="text-sm text-blue-600">Évolution de vos rendements sur une année</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Mensuel</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Cumulé</span>
                  </div>
                </div>
              </div>

              <div className="relative h-64 w-full">
                <div className="absolute left-0 bottom-0 w-full h-full flex items-end">
                  <div className="w-full flex justify-between items-end h-full">
                    {projectedReturns.map((data, index) => (
                      <div key={index} className="flex flex-col items-center h-full justify-end" style={{ width: `${100 / projectedReturns.length}%` }}>
                        <div
                          className="w-full max-w-[20px] bg-green-500 rounded-t mx-auto"
                          style={{ height: `${Math.min(95, (data.cumulativeReturn / (totalInvestedAmount * 0.15)) * 100)}%` }}
                        ></div>
                        <div
                          className="w-full max-w-[12px] bg-blue-500 rounded-t mx-auto mt-[-4px]"
                          style={{ height: `${Math.min(80, (data.monthlyReturn / (totalInvestedAmount * 0.015)) * 100)}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">{data.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total investi</p>
                  <p className="text-sm font-medium text-gray-800">{totalInvestedAmount.toFixed(0)} €</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Rendement mensuel moyen</p>
                  <p className="text-sm font-medium text-green-600">
                    {(projectedReturns[0]?.monthlyReturn || 0).toFixed(0)} €
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Rendement total sur 12 mois</p>
                  <p className="text-sm font-medium text-green-700">
                    {(projectedReturns[11]?.cumulativeReturn || 0).toFixed(0)} €
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {userInvestments && userInvestments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center mb-3">
                  <div className="bg-white p-1.5 rounded-md mr-2">
                    <PercentIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="text-sm font-medium text-green-800">Taux de rendement</h4>
                </div>
                <p className="text-2xl font-bold text-green-700 mb-1">12%</p>
                <p className="text-xs text-green-600">Rendement annuel moyen</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center mb-3">
                  <div className="bg-white p-1.5 rounded-md mr-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-medium text-blue-800">Fréquence</h4>
                </div>
                <p className="text-2xl font-bold text-blue-700 mb-1">Mensuel</p>
                <p className="text-xs text-blue-600">Versements le 5 de chaque mois</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center mb-3">
                  <div className="bg-white p-1.5 rounded-md mr-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="text-sm font-medium text-purple-800">Projection à 1 an</h4>
                </div>
                <p className="text-2xl font-bold text-purple-700 mb-1">
                  {(totalInvestedAmount * 0.12).toFixed(0)} €
                </p>
                <p className="text-xs text-purple-600">Rendement total projeté</p>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 border-t border-gray-100 pt-4">
            <p className="mb-1"><strong>Note:</strong> Ces projections sont basées sur un rendement moyen de 12% par an et peuvent varier en fonction des performances réelles des projets.</p>
            <p>Les versements sont généralement effectués le 5 de chaque mois, après la période de délai initial spécifiée dans chaque projet.</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start md:items-center flex-col md:flex-row justify-between mb-6">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="bg-blue-50 p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Projections futures</h3>
              <p className="text-sm text-blue-600">Vos prochains versements planifiés</p>
            </div>
          </div>
        </div>

        <div className="relative h-64 w-full mb-6">
          <div className="absolute left-0 bottom-0 w-full h-full flex items-end">
            <div className="w-full flex justify-between items-end h-full">
              {projectedReturns.map((data, index) => (
                <div key={index} className="flex flex-col items-center h-full justify-end" style={{ width: `${100 / projectedReturns.length}%` }}>
                  <div
                    className="w-full max-w-[20px] bg-green-500 rounded-t mx-auto"
                    style={{ height: `${Math.min(95, (data.cumulativeReturn / (totalInvestedAmount * 0.15)) * 100)}%` }}
                  ></div>
                  <div
                    className="w-full max-w-[12px] bg-blue-500 rounded-t mx-auto mt-[-4px]"
                    style={{ height: `${Math.min(80, (data.monthlyReturn / (totalInvestedAmount * 0.015)) * 100)}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">M{data.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total investi</p>
            <p className="text-sm font-medium text-gray-800">{totalInvestedAmount.toFixed(0)} €</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Rendement mensuel moyen</p>
            <p className="text-sm font-medium text-green-600">
              {(projectedReturns[0]?.monthlyReturn || 0).toFixed(0)} €
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Rendement total sur 12 mois</p>
            <p className="text-sm font-medium text-green-700">
              {(projectedReturns[11]?.cumulativeReturn || 0).toFixed(0)} €
            </p>
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

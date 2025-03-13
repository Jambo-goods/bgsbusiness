
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAllUsersData } from '@/hooks/admin/useAllUsersData';
import { useProjectsData } from '@/hooks/admin/useProjectsData';
import { useBankTransfersData } from '@/hooks/admin/useBankTransfersData';
import { useWalletTransactionsData } from '@/hooks/admin/useWalletTransactionsData';
import { useWithdrawalRequestsData } from '@/hooks/admin/useWithdrawalRequestsData';
import { useScheduledPaymentsData } from '@/hooks/admin/useScheduledPaymentsData';
import { Database, Users, Building, Clock, Wallet, CreditCard, BanknoteIcon } from 'lucide-react';
import DatabaseLayout from '@/layouts/DatabaseLayout';

export default function DatabaseDashboard() {
  const { users, totalUsers } = useAllUsersData();
  const { projects, totalCount: projectsCount } = useProjectsData();
  const { payments, totalCount: paymentsCount } = useScheduledPaymentsData();
  const { transactions, totalCount: transactionsCount } = useWalletTransactionsData();
  const { withdrawals, totalCount: withdrawalsCount } = useWithdrawalRequestsData();
  const { transfers, totalCount: transfersCount } = useBankTransfersData();

  // Calculer le montant total des transactions
  const totalTransactionsAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  
  // Calculer le montant total des retraits
  const totalWithdrawalsAmount = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  
  // Calculer le montant total des virements bancaires
  const totalTransfersAmount = transfers.reduce((sum, transfer) => sum + (transfer.amount || 0), 0);

  const stats = [
    {
      title: 'Utilisateurs',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
      link: '/database/users',
    },
    {
      title: 'Projets',
      value: projectsCount,
      icon: Building,
      color: 'bg-green-100 text-green-700',
      link: '/database/projects',
    },
    {
      title: 'Paiements programmés',
      value: paymentsCount,
      icon: Clock,
      color: 'bg-purple-100 text-purple-700',
      link: '/database/scheduled-payments',
    },
    {
      title: 'Transactions',
      value: transactionsCount,
      icon: Wallet,
      color: 'bg-orange-100 text-orange-700',
      link: '/database/wallet-transactions',
    },
    {
      title: 'Demandes de retrait',
      value: withdrawalsCount,
      icon: CreditCard,
      color: 'bg-red-100 text-red-700',
      link: '/database/withdrawal-requests',
    },
    {
      title: 'Virements bancaires',
      value: transfersCount,
      icon: BanknoteIcon,
      color: 'bg-indigo-100 text-indigo-700',
      link: '/database/bank-transfers',
    },
  ];

  const financialStats = [
    {
      title: 'Volume de transactions',
      value: `${totalTransactionsAmount.toLocaleString('fr-FR')} €`,
      icon: Wallet,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      title: 'Volume de retraits',
      value: `${totalWithdrawalsAmount.toLocaleString('fr-FR')} €`,
      icon: CreditCard,
      color: 'bg-red-100 text-red-700',
    },
    {
      title: 'Volume de virements bancaires',
      value: `${totalTransfersAmount.toLocaleString('fr-FR')} €`,
      icon: BanknoteIcon,
      color: 'bg-indigo-100 text-indigo-700',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Tableau de bord | Admin Database</title>
      </Helmet>

      <DatabaseLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
            <div className="flex items-center bg-gray-100 px-4 py-2 rounded-md">
              <Database className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Base de données en direct</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <a 
                key={index} 
                href={stat.link}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-xl font-semibold">{stat.value}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Données financières</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {financialStats.map((stat, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-md ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-xl font-semibold">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Derniers utilisateurs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.slice(0, 5).map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Derniers projets</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.slice(0, 5).map((project) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{project.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' : 
                            project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DatabaseLayout>
    </>
  );
}

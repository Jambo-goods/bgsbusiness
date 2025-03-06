
import React from 'react';
import { Users, CreditCard, Database, ArrowLeftRight } from 'lucide-react';

type StatsProps = {
  stats: {
    userCount: number;
    totalInvestments: number;
    totalProjects: number;
    pendingWithdrawals: number;
  };
  isLoading: boolean;
};

export default function DashboardStats({ stats, isLoading }: StatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="h-6 w-6 text-bgs-blue" />
          </div>
          <h3 className="text-lg text-gray-700">Utilisateurs</h3>
        </div>
        <p className="text-3xl font-bold text-bgs-blue">{stats.userCount}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg text-gray-700">Investissements</h3>
        </div>
        <p className="text-3xl font-bold text-green-600">{stats.totalInvestments.toLocaleString()} €</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Database className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg text-gray-700">Projets</h3>
        </div>
        <p className="text-3xl font-bold text-purple-600">{stats.totalProjects}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <ArrowLeftRight className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg text-gray-700">Retraits en attente</h3>
        </div>
        <p className="text-3xl font-bold text-red-600">{stats.pendingWithdrawals}</p>
      </div>
    </div>
  );
}


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Wallet, ArrowUpRight, ArrowDownRight, Database, Package, BanknotesIcon, CoinsIcon } from 'lucide-react';
import { AdminStats } from '@/hooks/admin/types';
import { formatCurrency } from '@/utils/currencyUtils';

interface AdminKPIStatsProps {
  stats: AdminStats;
  isLoading: boolean;
}

export default function AdminKPIStats({ stats, isLoading }: AdminKPIStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-10 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Profils utilisateurs</p>
            <h3 className="text-2xl font-bold mt-1">{stats.userCount}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total des soldes</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalWalletBalance)}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <Wallet className="h-6 w-6 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Virements reçus</p>
            <h3 className="text-2xl font-bold mt-1">{stats.receivedTransfersCount}</h3>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.receivedTransfersAmount)}</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-full">
            <ArrowUpRight className="h-6 w-6 text-emerald-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Demandes de retrait</p>
            <h3 className="text-2xl font-bold mt-1">{stats.withdrawalRequestsCount}</h3>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.withdrawalRequestsAmount)}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-full">
            <ArrowDownRight className="h-6 w-6 text-amber-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">En attente de retrait</p>
            <h3 className="text-2xl font-bold mt-1">{stats.pendingWithdrawals}</h3>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <ArrowDownRight className="h-6 w-6 text-orange-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total des investissements</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalInvestments)}</h3>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Database className="h-6 w-6 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total des projets</p>
            <h3 className="text-2xl font-bold mt-1">{stats.totalProjects}</h3>
          </div>
          <div className="bg-gray-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-gray-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Projets actifs</p>
            <h3 className="text-2xl font-bold mt-1">{stats.ongoingProjects}</h3>
          </div>
          <div className="bg-indigo-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-indigo-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

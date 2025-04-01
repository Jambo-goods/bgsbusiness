
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStats } from '@/hooks/admin/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ChartBar, ChartLine } from 'lucide-react';

interface AdminKPIChartsProps {
  stats: AdminStats;
  isLoading: boolean;
}

export default function AdminKPICharts({ stats, isLoading }: AdminKPIChartsProps) {
  // Préparer les données pour les graphiques
  const financialData = [
    { name: 'Soldes', value: stats.totalWalletBalance },
    { name: 'Investissements', value: stats.totalInvestments },
    { name: 'Retraits', value: stats.withdrawalRequestsAmount },
    { name: 'Virements', value: stats.receivedTransfersAmount },
  ];

  const projectData = [
    { name: 'Total', value: stats.totalProjects },
    { name: 'En cours', value: stats.ongoingProjects },
  ];

  const userActivityData = [
    { name: 'Utilisateurs', value: stats.userCount },
    { name: 'Virements', value: stats.receivedTransfersCount },
    { name: 'Retraits', value: stats.withdrawalRequestsCount },
    { name: 'Projets', value: stats.totalProjects },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        <Card>
          <CardHeader className="pb-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-blue-600" />
            Aperçu financier (€)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={financialData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString()} €`, 'Montant']}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChartLine className="h-5 w-5 text-green-600" />
            Activité des utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userActivityData}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Nombre']}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

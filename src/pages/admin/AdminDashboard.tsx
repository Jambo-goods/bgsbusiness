
import React from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import useAdminDashboard from '@/hooks/admin/useAdminDashboard';
import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import AdminLogsList from '@/components/admin/dashboard/AdminLogsList';
import QuickActions from '@/components/admin/dashboard/QuickActions';
import StatusIndicator from '@/components/admin/dashboard/StatusIndicator';

export default function AdminDashboard() {
  const { adminUser } = useAdmin();
  const { 
    stats, 
    isLoading, 
    isRefreshing, 
    adminLogs, 
    realTimeStatus, 
    handleManualRefresh 
  } = useAdminDashboard();

  // Last login info
  const lastLogin = adminUser?.last_login 
    ? new Date(adminUser.last_login).toLocaleString('fr-FR')
    : 'Première connexion';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-bgs-blue">Tableau de bord administrateur</h1>
        <StatusIndicator 
          realTimeStatus={realTimeStatus}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <p className="text-gray-500">
          Bienvenue, <span className="font-medium text-bgs-blue">{adminUser?.first_name} {adminUser?.last_name}</span>.
          Dernière connexion: {lastLogin}
        </p>
      </div>
      
      <DashboardStats stats={stats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-bgs-blue mb-4">Dernières actions</h2>
          <AdminLogsList adminLogs={adminLogs} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-bgs-blue mb-4">Actions rapides</h2>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

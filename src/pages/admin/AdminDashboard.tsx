
import React from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardGrid from '@/components/admin/dashboard/DashboardGrid';
import ActivitySection from '@/components/admin/dashboard/ActivitySection';
import QuickActionsSection from '@/components/admin/dashboard/QuickActionsSection';
import AdminUsers from '@/components/admin/dashboard/AdminUsers';
import AllUsersSection from '@/components/admin/dashboard/AllUsersSection';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

export default function AdminDashboard() {
  const { stats, adminLogs, isLoading, isRefreshing, refreshData } = useAdminDashboard();

  return (
    <>
      <Helmet>
        <title>Tableau de bord Admin | BGS Invest</title>
      </Helmet>

      <div className="space-y-6">
        <DashboardHeader 
          systemStatus="operational" 
          isRefreshing={isRefreshing}
          refreshData={refreshData}
        />
        
        <DashboardGrid stats={stats} isLoading={isLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivitySection adminLogs={adminLogs} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <QuickActionsSection />
          </div>
        </div>
        
        <AllUsersSection />
        
        <AdminUsers />
      </div>
    </>
  );
}

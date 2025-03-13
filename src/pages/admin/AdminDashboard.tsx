
import React from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import ActivitySection from '@/components/admin/dashboard/ActivitySection';
import QuickActionsSection from '@/components/admin/dashboard/QuickActionsSection';
import AllUsersSection from '@/components/admin/dashboard/AllUsersSection';
import AdminUsers from '@/components/admin/dashboard/AdminUsers';
import { useAllUsersData } from '@/hooks/admin/useAllUsersData';

export default function AdminDashboard() {
  const { users, isLoading, totalUsers, refreshUsers } = useAllUsersData();
  
  const stats = {
    totalUsers: totalUsers,
    newUsersToday: 0,
    totalProjects: 0,
    activeProjects: 0
  };

  const systemStatus = {
    status: 'operational',
    lastUpdated: new Date().toISOString()
  };

  return (
    <>
      <Helmet>
        <title>Tableau de bord | Administration BGS</title>
      </Helmet>
      
      <div className="space-y-8">
        <DashboardHeader 
          systemStatus={systemStatus} 
          isRefreshing={isLoading} 
          refreshData={refreshUsers} 
        />
        
        <DashboardStats stats={stats} isLoading={isLoading} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <ActivitySection adminLogs={[]} isLoading={isLoading} />
          </div>
          <div className="md:col-span-1">
            <QuickActionsSection />
          </div>
        </div>
        
        <AdminUsers />
        <AllUsersSection />
      </div>
    </>
  );
}


import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import ActivitySection from "@/components/admin/dashboard/ActivitySection";
import QuickActionsSection from "@/components/admin/dashboard/QuickActionsSection";
import DashboardGrid from "@/components/admin/dashboard/DashboardGrid";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { 
    stats, 
    adminLogs, 
    isLoading, 
    isRefreshing, 
    refreshData 
  } = useAdminDashboard();

  // Système toujours opérationnel par défaut, à adapter selon les besoins
  const systemStatus = 'operational';

  return (
    <div className="p-6">
      <Helmet>
        <title>Administration | Tableau de bord</title>
      </Helmet>
      
      <DashboardHeader 
        systemStatus={systemStatus as 'operational' | 'degraded' | 'maintenance'} 
        isRefreshing={isRefreshing} 
        refreshData={refreshData}
      />
      
      <div className="space-y-6">
        <DashboardStats stats={stats} isLoading={isLoading} />
        
        <DashboardGrid>
          <ActivitySection adminLogs={adminLogs} isLoading={isLoading} />
          <QuickActionsSection />
        </DashboardGrid>
      </div>
    </div>
  );
}

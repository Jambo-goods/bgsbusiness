
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import StatusIndicator from "@/components/admin/dashboard/StatusIndicator";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import AdminLogsList from "@/components/admin/dashboard/AdminLogsList";
import QuickActions from "@/components/admin/dashboard/QuickActions";

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-bgs-blue mb-4 md:mb-0">
          Tableau de bord d'administration
        </h1>
        
        <StatusIndicator 
          systemStatus={systemStatus as 'operational' | 'degraded' | 'maintenance'}
          isRefreshing={isRefreshing}
          onRefresh={refreshData}
        />
      </div>
      
      <div className="space-y-6">
        <DashboardStats stats={stats} isLoading={isLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">
              Actions récentes
            </h2>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="py-3">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <AdminLogsList adminLogs={adminLogs} />
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-bgs-blue mb-4">
              Actions rapides
            </h2>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}

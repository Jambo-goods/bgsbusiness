
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChartBar } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import AdminKPIStats from "@/components/admin/dashboard/AdminKPIStats";
import ActivitySection from "@/components/admin/dashboard/ActivitySection";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";

export default function AdminDashboardPage() {
  const { stats, adminLogs, isLoading, isRefreshing, refreshData } = useAdminDashboard();
  
  return (
    <>
      <Helmet>
        <title>Tableau de bord administrateur | BGS Invest</title>
      </Helmet>
      
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Tableau de bord administrateur</h1>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <AdminKPIStats stats={stats} isLoading={isLoading} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Statistiques générales</h2>
                  <DashboardStats stats={stats} isLoading={isLoading} />
                </div>
                
                <div className="lg:col-span-1">
                  <ActivitySection adminLogs={adminLogs} isLoading={isLoading} />
                </div>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

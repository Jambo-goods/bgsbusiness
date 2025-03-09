import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import ActivitySection from "@/components/admin/dashboard/ActivitySection";
import QuickActionsSection from "@/components/admin/dashboard/QuickActionsSection";
import DashboardGrid from "@/components/admin/dashboard/DashboardGrid";
import BankTransferTable from "@/components/admin/dashboard/BankTransferTable";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CircleInfo } from "lucide-react";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(true);
  
  const { 
    stats, 
    adminLogs, 
    isLoading, 
    isRefreshing, 
    refreshData 
  } = useAdminDashboard();

  const fetchPendingTransfers = async () => {
    try {
      setIsLoadingTransfers(true);
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          profile:profiles(first_name, last_name, email)
        `)
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPendingTransfers(data || []);
    } catch (error) {
      console.error("Error fetching pending transfers:", error);
    } finally {
      setIsLoadingTransfers(false);
    }
  };

  useEffect(() => {
    fetchPendingTransfers();
  }, []);

  const refreshAllData = () => {
    refreshData();
    fetchPendingTransfers();
  };

  const systemStatus = 'operational';

  return (
    <div className="p-6">
      <Helmet>
        <title>Administration | Tableau de bord</title>
      </Helmet>
      
      <DashboardHeader 
        systemStatus={systemStatus as 'operational' | 'degraded' | 'maintenance'} 
        isRefreshing={isRefreshing} 
        refreshData={refreshAllData}
      />
      
      <div className="space-y-6">
        <DashboardStats stats={stats} isLoading={isLoading} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Virements bancaires en attente</h2>
          <Alert className="mb-4">
            <CircleInfo className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Confirmez les virements bancaires après avoir vérifié leur réception sur le compte bancaire de l'entreprise.
              Assurez-vous de vérifier la référence du virement et d'entrer le montant exact reçu.
            </AlertDescription>
          </Alert>
          <BankTransferTable 
            pendingTransfers={pendingTransfers} 
            isLoading={isLoadingTransfers} 
            refreshData={fetchPendingTransfers} 
          />
        </div>
        
        <DashboardGrid>
          <ActivitySection adminLogs={adminLogs} isLoading={isLoading} />
          <QuickActionsSection />
        </DashboardGrid>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";
import { useAuthActions } from "@/hooks/use-auth-actions";

export default function Dashboard() {
  // État initial du dashboard
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userData, userInvestments, loading, fetchUserData } = useDashboardData();
  const { handleLogout } = useAuthActions();

  // Configure realtime updates
  useRealtimeUpdates(fetchUserData);

  // Initial data fetch
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <DashboardLoading />;
  }

  if (!userData) {
    return <DashboardLoading />;
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      userData={userData}
      userInvestments={userInvestments}
      handleLogout={handleLogout}
      refreshData={fetchUserData}
    />
  );
}


import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Configure realtime updates
  useRealtimeUpdates(fetchUserData);

  // Initial data fetch
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();
  }, []);

  // Handle routing for specific tabs
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/dashboard/wallet')) {
      setActiveTab("wallet");
    } else if (path.includes('/dashboard/investments')) {
      setActiveTab("investments");
    } else if (path.includes('/dashboard/tracking')) {
      setActiveTab("tracking");
    } else if (path.includes('/dashboard/profile')) {
      setActiveTab("profile");
    } else if (path.includes('/dashboard/settings')) {
      setActiveTab("settings");
    } else {
      setActiveTab("overview");
    }
  }, [window.location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Update URL based on selected tab
    if (tab === "overview") {
      navigate("/dashboard");
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  if (loading) {
    return <DashboardLoading />;
  }

  if (!userData) {
    return <DashboardLoading />;
  }

  return (
    <Routes>
      <Route path="/*" element={
        <DashboardLayout
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          userData={userData}
          userInvestments={userInvestments}
          handleLogout={handleLogout}
          refreshData={fetchUserData}
        />
      } />
    </Routes>
  );
}

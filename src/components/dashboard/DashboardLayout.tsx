
import { useState } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMain from "@/components/dashboard/DashboardMain";
import MobileSidebarToggle from "@/components/dashboard/MobileSidebarToggle";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  userData: any;
  userInvestments: any[];
  isLoading: boolean;
  realTimeStatus: string;
  refreshData: () => Promise<void>;
}

export default function DashboardLayout({ 
  userData, 
  userInvestments, 
  isLoading, 
  realTimeStatus,
  refreshData
}: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-bgs-gray-light flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        {/* Mobile sidebar toggle */}
        <MobileSidebarToggle 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        {/* Real-time status indicator - Mobile optimized */}
        <div className="fixed bottom-4 right-4 flex items-center bg-white p-2 rounded-lg shadow-md z-50">
          <div className={`h-2 w-2 rounded-full mr-2 animate-pulse ${
            realTimeStatus === 'connected' ? 'bg-green-500' : 
            realTimeStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className="text-xs text-gray-600">
            {realTimeStatus === 'connected' ? 'Temps réel actif' : 
             realTimeStatus === 'error' ? 'Erreur temps réel' : 'Connexion...'}
          </span>
        </div>
        
        {/* Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
        
        {/* Main content */}
        <DashboardMain
          isSidebarOpen={isSidebarOpen}
          userData={userData}
          activeTab={activeTab}
          userInvestments={userInvestments}
          setActiveTab={setActiveTab}
          refreshData={refreshData}
        />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}


import React from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardMain from "./DashboardMain";
import MobileSidebarToggle from "./MobileSidebarToggle";
import { Project } from "@/types/project";
import { UserData } from "@/hooks/use-dashboard-data";

interface DashboardLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userData: UserData;
  userInvestments: Project[];
  handleLogout: () => void;
  refreshData: () => void;
}

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  toggleSidebar,
  userData,
  userInvestments,
  handleLogout,
  refreshData
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-bgs-gray-light flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-20">
        {/* Mobile sidebar toggle */}
        <MobileSidebarToggle 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
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
      
      <Footer />
    </div>
  );
}


import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import TabContent from "./TabContent";
import { Project } from "@/types/project";

interface DashboardMainProps {
  isSidebarOpen: boolean;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    investmentTotal: number;
    projectsCount: number;
    walletBalance?: number;
    userId?: string;
  };
  activeTab: string;
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
  refreshData?: () => Promise<void>;
}

export default function DashboardMain({ 
  isSidebarOpen, 
  userData, 
  activeTab, 
  userInvestments, 
  setActiveTab,
  refreshData
}: DashboardMainProps) {
  // Memoized main content to prevent unnecessary re-renders
  const dashboardContent = useMemo(() => (
    <TabContent 
      activeTab={activeTab} 
      userData={userData} 
      userInvestments={userInvestments} 
      refreshData={refreshData}
      setActiveTab={setActiveTab}
    />
  ), [activeTab, userData, userInvestments, setActiveTab, refreshData]);

  return (
    <div 
      className={cn(
        "flex-1 py-4 w-full transition-all duration-300",
        "animate-fade-in",
        isSidebarOpen ? "md:ml-0" : "md:ml-0"
      )}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader 
          userData={userData} 
          refreshData={refreshData} 
          setActiveTab={setActiveTab}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Main dashboard content based on active tab */}
          <div className={cn(
            "bg-white rounded-xl shadow-md overflow-hidden",
            "md:col-span-1"
          )}>
            <div className="p-5 animate-fade-in">
              {dashboardContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

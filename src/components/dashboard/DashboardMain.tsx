
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import TabContent from "./TabContent";
import { Project } from "@/types/project";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  // Memoized main content to prevent unnecessary re-renders
  const dashboardContent = useMemo(() => (
    <TabContent 
      activeTab={activeTab} 
      userData={userData} 
      userInvestments={userInvestments} 
      setActiveTab={setActiveTab} 
      refreshData={refreshData}
    />
  ), [activeTab, userData, userInvestments, setActiveTab, refreshData]);

  return (
    <div 
      className={cn(
        "flex-1 py-4 px-4 md:px-6 w-full transition-all duration-300",
        "animate-fade-in",
        isSidebarOpen && isMobile ? "opacity-50 pointer-events-none" : "opacity-100"
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
            <div className="p-4 md:p-5 animate-fade-in">
              {dashboardContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

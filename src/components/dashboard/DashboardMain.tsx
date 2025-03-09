
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import TabContent from "./TabContent";
import { Project } from "@/types/project";
import { WalletDisplay } from "./wallet/WalletDisplay";

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main dashboard content based on active tab */}
          <div className={cn(
            "bg-white rounded-xl shadow-md overflow-hidden",
            activeTab === "wallet" ? "md:col-span-2" : "md:col-span-3"
          )}>
            <div className="p-5 animate-fade-in">
              {dashboardContent}
            </div>
          </div>
          
          {/* Show wallet display if on wallet tab */}
          {activeTab === "wallet" && (
            <div className="md:col-span-1">
              <WalletDisplay />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

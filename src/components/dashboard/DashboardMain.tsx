
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import TabContent from "./TabContent";
import { Project } from "@/types/project";
import { useWalletBalance } from "@/hooks/useWalletBalance";

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
  const { walletBalance, isLoadingBalance, refreshBalance } = useWalletBalance();
  
  // Merge the walletBalance from hook with userData
  const enhancedUserData = useMemo(() => ({
    ...userData,
    walletBalance: isLoadingBalance ? userData.walletBalance : walletBalance
  }), [userData, walletBalance, isLoadingBalance]);
  
  // Memoized main content to prevent unnecessary re-renders
  const dashboardContent = useMemo(() => (
    <TabContent 
      activeTab={activeTab} 
      userData={enhancedUserData} 
      userInvestments={userInvestments} 
      setActiveTab={setActiveTab} 
      refreshData={async () => {
        if (refreshData) await refreshData();
        await refreshBalance();
      }}
    />
  ), [activeTab, enhancedUserData, userInvestments, setActiveTab, refreshData, refreshBalance]);

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
          userData={enhancedUserData} 
          refreshData={async () => {
            if (refreshData) await refreshData();
            await refreshBalance();
          }} 
          setActiveTab={setActiveTab}
        />
        
        {/* Dashboard content based on active tab */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 animate-fade-in">
            {dashboardContent}
          </div>
        </div>
      </div>
    </div>
  );
}

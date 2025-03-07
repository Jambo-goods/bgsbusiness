
import React from "react";
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
  };
  activeTab: string;
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
  refreshData?: () => Promise<void>;
  realTimeStatus?: 'connecting' | 'connected' | 'error';
}

export default function DashboardMain({ 
  isSidebarOpen, 
  userData, 
  activeTab, 
  userInvestments, 
  setActiveTab,
  refreshData,
  realTimeStatus
}: DashboardMainProps) {
  return (
    <div className={cn(
      "flex-1 px-4 md:px-6 py-4 w-full transition-all duration-300 mt-8",
      isSidebarOpen ? "md:ml-0" : "md:ml-0"
    )}>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader userData={userData} refreshData={refreshData} realTimeStatus={realTimeStatus} />
        
        {/* Dashboard content based on active tab */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <TabContent 
            activeTab={activeTab} 
            userData={userData} 
            userInvestments={userInvestments} 
            setActiveTab={setActiveTab} 
            refreshData={refreshData}
          />
        </div>
      </div>
    </div>
  );
}

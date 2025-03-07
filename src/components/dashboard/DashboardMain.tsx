
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
}

export default function DashboardMain({ 
  isSidebarOpen, 
  userData, 
  activeTab, 
  userInvestments, 
  setActiveTab,
  refreshData
}: DashboardMainProps) {
  return (
    <div className={cn(
      "flex-1 px-4 md:px-6 py-6 w-full mt-16 transition-all duration-300",
      isSidebarOpen ? "md:ml-0" : "md:ml-0"
    )}>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader userData={userData} />
        
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

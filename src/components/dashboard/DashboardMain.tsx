
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
    <main className={cn(
      "flex-1 p-6 transition-all",
      isSidebarOpen ? "md:ml-0" : "md:ml-0"
    )}>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader userData={userData} />
        
        {/* Dashboard content based on active tab */}
        <TabContent 
          activeTab={activeTab} 
          userData={userData} 
          userInvestments={userInvestments} 
          setActiveTab={setActiveTab} 
          refreshData={refreshData}
        />
      </div>
    </main>
  );
}

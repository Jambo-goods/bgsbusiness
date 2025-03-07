import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import TabContent from "./TabContent";
import { Project } from "@/types/project";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProjectsList from "@/components/projects/ProjectsList";
import { projects } from "@/data/projects";
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
  // Filter state for projects display
  const [projectFilter, setProjectFilter] = useState<"all" | "active" | "upcoming" | "completed">("all");

  // Filtered projects based on selected filter
  const filteredProjects = useMemo(() => {
    if (projectFilter === "all") return projects;
    return projects.filter(project => project.status === projectFilter);
  }, [projectFilter]);

  // Memoized main content to prevent unnecessary re-renders
  const dashboardContent = useMemo(() => <TabContent activeTab={activeTab} userData={userData} userInvestments={userInvestments} setActiveTab={setActiveTab} refreshData={refreshData} />, [activeTab, userData, userInvestments, setActiveTab, refreshData]);
  return <div className={cn("flex-1 py-4 w-full transition-all duration-300", "animate-fade-in", isSidebarOpen ? "md:ml-0" : "md:ml-0")}>
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader userData={userData} refreshData={refreshData} realTimeStatus={realTimeStatus} />
        
        {/* Dashboard content based on active tab */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 animate-fade-in">
            {dashboardContent}
          </div>
        </div>
        
        {/* Available Investment Projects Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          
        </div>
      </div>
    </div>;
}
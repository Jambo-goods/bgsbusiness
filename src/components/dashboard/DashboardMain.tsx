
import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import TabContent from "./TabContent";
import { Project } from "@/types/project";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProjectsList from "@/components/projects/ProjectsList";
import { Building } from "lucide-react";

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
  const [projectsTab, setProjectsTab] = useState<string>("all");
  
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

  // Get available projects from data/projects.ts - they'll be fetched from elsewhere in a real app
  const availableProjects = useMemo(() => {
    // We're importing this inside the component to avoid bundling issues
    const { projects } = require("@/data/projects");
    return projects;
  }, []);

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
          realTimeStatus={realTimeStatus} 
        />
        
        {/* Dashboard content based on active tab */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 animate-fade-in">
            {dashboardContent}
          </div>
        </div>
        
        {/* Available projects section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-5 animate-fade-in">
            <div className="flex items-center mb-4">
              <Building className="h-5 w-5 mr-2 text-bgs-blue" />
              <h2 className="text-xl font-bold text-bgs-blue">Projets proposés</h2>
            </div>
            
            <Tabs defaultValue="all" value={projectsTab} onValueChange={setProjectsTab} className="w-full">
              <TabsList className="mb-4 bg-gray-100">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="active">Actifs</TabsTrigger>
                <TabsTrigger value="upcoming">À venir</TabsTrigger>
                <TabsTrigger value="completed">Terminés</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-2">
                <ProjectsList projects={availableProjects} />
              </TabsContent>
              
              <TabsContent value="active" className="mt-2">
                <ProjectsList 
                  projects={availableProjects.filter(
                    (project: Project) => project.status === "active"
                  )} 
                />
              </TabsContent>
              
              <TabsContent value="upcoming" className="mt-2">
                <ProjectsList 
                  projects={availableProjects.filter(
                    (project: Project) => project.status === "upcoming"
                  )} 
                />
              </TabsContent>
              
              <TabsContent value="completed" className="mt-2">
                <ProjectsList 
                  projects={availableProjects.filter(
                    (project: Project) => project.status === "completed"
                  )} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

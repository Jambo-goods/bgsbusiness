
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import DashboardHeader from "./DashboardHeader";
import TabContent from "./TabContent";
import { Project } from "@/types/project";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // Récupérer uniquement les investissements actifs
  const activeInvestments = useMemo(() => 
    userInvestments.filter(inv => inv.status === "active"),
  [userInvestments]);

  // Récupérer les investissements en fonction de leur statut
  const completedInvestments = useMemo(() => 
    userInvestments.filter(inv => inv.status === "completed"),
  [userInvestments]);

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
        <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
          {activeTab === "investments" ? (
            <div className="p-5">
              <h2 className="text-xl font-semibold text-bgs-blue mb-6">Mes investissements</h2>
              
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 bg-gray-100 p-1">
                  <TabsTrigger value="all" className="text-sm">
                    Tous ({userInvestments.length})
                  </TabsTrigger>
                  <TabsTrigger value="active" className="text-sm">
                    Actifs ({activeInvestments.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-sm">
                    Terminés ({completedInvestments.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-2 animate-fade-in">
                  <div className="space-y-4">
                    {userInvestments.length > 0 ? (
                      <ProjectsList projects={userInvestments} />
                    ) : (
                      <p className="text-center py-8 text-bgs-gray-medium">Aucun investissement trouvé.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="active" className="mt-2 animate-fade-in">
                  <div className="space-y-4">
                    {activeInvestments.length > 0 ? (
                      <ProjectsList projects={activeInvestments} />
                    ) : (
                      <p className="text-center py-8 text-bgs-gray-medium">Aucun investissement actif trouvé.</p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="completed" className="mt-2 animate-fade-in">
                  <div className="space-y-4">
                    {completedInvestments.length > 0 ? (
                      <ProjectsList projects={completedInvestments} />
                    ) : (
                      <p className="text-center py-8 text-bgs-gray-medium">Aucun investissement terminé trouvé.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="p-5 animate-fade-in">
              {dashboardContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher la liste des projets
const ProjectsList = ({ projects }: { projects: Project[] }) => {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="border bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            <img 
              src={project.image} 
              alt={project.name} 
              className="w-full md:w-40 h-32 object-cover"
            />
            <div className="p-3 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-bgs-blue text-sm mb-0.5">{project.name}</h3>
                  <p className="text-xs text-bgs-gray-medium mb-2">{project.location}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'active' 
                    ? 'bg-blue-100 text-blue-600' 
                    : project.status === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Complété' : 'À venir'}
                </span>
              </div>
              
              <p className="text-xs text-bgs-blue/80 mb-3 line-clamp-1">
                {project.description}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-bgs-gray-medium">Montant investi</p>
                  <p className="font-medium text-bgs-blue text-sm">{project.investedAmount || 0} €</p>
                </div>
                <div>
                  <p className="text-xs text-bgs-gray-medium">Rendement mensuel</p>
                  <p className="font-medium text-green-500 text-sm">{project.yield}%</p>
                </div>
                <div>
                  <p className="text-xs text-bgs-gray-medium">Durée</p>
                  <p className="font-medium text-bgs-blue text-sm">{project.duration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

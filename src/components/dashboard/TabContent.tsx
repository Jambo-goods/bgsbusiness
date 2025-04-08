import { lazy, Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Overview from "./Overview";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "@/types/project";
import { fetchProjectsFromDatabase } from "@/utils/projectUtils";
import { Calendar, MapPin, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/currencyUtils";

// Prefetch critical paths - using dynamic imports instead of direct imports
const WalletTab = lazy(() => import("./tabs/WalletTab"));
const YieldTab = lazy(() => import("./tabs/YieldTab"));
const Investments = lazy(() => import("./Investments"));
const ProfileTab = lazy(() => import("./tabs/ProfileTab"));
const SettingsTab = lazy(() => import("./tabs/SettingsTab"));
const NotificationsTab = lazy(() => import("./tabs/NotificationsTab"));
const HistoryTab = lazy(() => import("./tabs/HistoryTab"));
const CapitalTab = lazy(() => import("./tabs/CapitalTab"));
interface TabContentProps {
  activeTab: string;
  userData: any;
  userInvestments: any[];
  setActiveTab: (tab: string) => void;
  refreshData?: () => Promise<void>;
}

// Optimized loading fallback component
const TabLoading = () => <div className="w-full space-y-3 p-3">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-8 w-3/4" />
  </div>;
export default function TabContent({
  activeTab,
  userData,
  userInvestments,
  setActiveTab,
  refreshData
}: TabContentProps) {
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  console.log("TabContent rendering with active tab:", activeTab);

  // Load projects from database only when "projects" tab is active
  useEffect(() => {
    const loadProjects = async () => {
      try {
        if (activeTab === "projects") {
          setLoading(true);
          // Load projects directly from utils
          const projects = await fetchProjectsFromDatabase();
          setDbProjects(projects || []);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading database projects:", error);
        setDbProjects([]);
        setLoading(false);
      }
    };
    loadProjects();
  }, [activeTab]);

  // Add debug logging when tab content changes
  useEffect(() => {
    console.log(`TabContent mounted/updated with active tab: ${activeTab}`);
  }, [activeTab]);
  return <div className="w-full mt-4">
      {activeTab === "overview" && <Overview userData={userData} userInvestments={userInvestments} setActiveTab={setActiveTab} />}
      
      {activeTab !== "overview" && <Suspense fallback={<TabLoading />}>
          {activeTab === "wallet" && <WalletTab />}
          
          {activeTab === "yield" && <YieldTab />}
          
          {activeTab === "investments" && <Investments userInvestments={userInvestments} onRefresh={refreshData} />}

          {activeTab === "projects" && <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-bgs-blue">Projets d'investissement proposés</h2>
              <p className="text-gray-600">
                Découvrez tous les projets d'investissement disponibles sur la plateforme et trouvez ceux qui correspondent à vos objectifs financiers.
              </p>
              {loading ? <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
                </div> : dbProjects && dbProjects.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dbProjects.map(project => <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                          <img src={project.image_url || "https://via.placeholder.com/400x300?text=Projet+BGS"} alt={project.name || "Projet d'investissement"} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
                          {project.status && <div className="absolute top-4 right-4">
                              <span className={cn("px-3 py-1 text-xs font-medium rounded-full", project.status === "active" ? "bg-blue-100 text-blue-800" : project.status === "completed" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800")}>
                                {project.status === "active" ? "En cours" : project.status === "completed" ? "Terminé" : "À venir"}
                              </span>
                            </div>}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2">{project.name || "Projet sans titre"}</h3>
                          {project.category && <p className="text-sm text-bgs-gray-medium mb-2">{project.category}</p>}
                          <p className="text-bgs-blue/80 mb-4 line-clamp-2">{project.description || "Aucune description disponible"}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {project.yield !== undefined && <div className="flex items-center gap-2">
                                <TrendingUp size={18} className="text-bgs-orange" />
                                <div>
                                  <p className="text-xs text-bgs-gray-medium">Rentabilité</p>
                                  <p className="font-semibold">{project.yield}%</p>
                                </div>
                              </div>}
                            {project.duration !== undefined && <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-bgs-orange" />
                                <div>
                                  <p className="text-xs text-bgs-gray-medium">Durée min</p>
                                  <p className="font-semibold">{project.duration} mois</p>
                                </div>
                              </div>}
                          </div>
                          
                          {project.location && <div className="flex items-center gap-2 mb-4">
                              <MapPin size={18} className="text-bgs-orange flex-shrink-0" />
                              <p className="text-sm text-bgs-blue/80">{project.location}</p>
                            </div>}

                          <div className="flex justify-between items-center mt-4">
                            <div>
                              <p className="text-xs text-bgs-gray-medium">Investissement min</p>
                              <p className="font-semibold text-bgs-blue">
                                {getInvestmentDisplay(project)}
                              </p>
                            </div>
                            <Link to={`/project/${project.id}`} className="bg-bgs-blue hover:bg-bgs-blue-light text-white px-4 py-2 rounded-lg transition-colors text-sm">
                              Voir détails
                            </Link>
                          </div>
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-20">
                    <p className="text-gray-500">Aucun projet disponible actuellement.</p>
                  </div>}
            </div>}
          
          {activeTab === "profile" && <ProfileTab userData={userData} />}

          {activeTab === "settings" && <SettingsTab />}
          
          {activeTab === "notifications" && <NotificationsTab />}
        </Suspense>}
    </div>;
}

// Helper function to handle investment display with consistent formatting
function getInvestmentDisplay(project: Project): string {
  // First check for min_investment, fallback to amount
  const value = project.min_investment || project.amount;

  // If we have a value, format it properly
  if (value && typeof value === 'number' && value > 0) {
    return formatCurrency(value);
  }

  // Default fallback
  return "Non spécifié";
}

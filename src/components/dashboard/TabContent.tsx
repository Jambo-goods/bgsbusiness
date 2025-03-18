
import { lazy, Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Overview from "./Overview";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectsList from "../projects/ProjectsList";
import { fetchProjectsFromDatabase } from "@/utils/projectUtils";
import { Project } from "@/types/project";

// Prefetch critical paths
const preloadWalletTab = () => import("./tabs/WalletTab");
const preloadInvestments = () => import("./Investments");
const preloadReferralTab = () => import("./tabs/ReferralTab");

// Lazy load tabs that aren't used as frequently
const WalletTab = lazy(() => preloadWalletTab());
const YieldTab = lazy(() => import("./tabs/YieldTab"));
const Investments = lazy(() => preloadInvestments());
const ProfileTab = lazy(() => import("./tabs/ProfileTab"));
const SettingsTab = lazy(() => import("./tabs/SettingsTab"));
const NotificationsTab = lazy(() => import("./tabs/NotificationsTab"));
const ReferralTab = lazy(() => preloadReferralTab());

interface TabContentProps {
  activeTab: string;
  userData: any;
  userInvestments: any[];
  setActiveTab: (tab: string) => void;
  refreshData?: () => Promise<void>;
}

// Optimized loading fallback component
const TabLoading = () => (
  <div className="w-full space-y-3 p-3">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-8 w-3/4" />
  </div>
);

// Prefetch critical paths on page load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    preloadWalletTab();
    preloadInvestments();
    preloadReferralTab();
  }, 2000); // Delay to prioritize initial render
}

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
  
  // Load projects from database only
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projects = await fetchProjectsFromDatabase();
        setDbProjects(projects || []);
      } catch (error) {
        console.error("Error loading database projects:", error);
        setDbProjects([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === "projects") {
      loadProjects();
    }
  }, [activeTab]);
  
  // Add debug logging when tab content changes
  useEffect(() => {
    console.log(`TabContent mounted/updated with active tab: ${activeTab}`);
  }, [activeTab]);
  
  return (
    <div className="w-full mt-4">
      {activeTab === "overview" && (
        <Overview 
          userData={userData} 
          userInvestments={userInvestments}
          setActiveTab={setActiveTab}
        />
      )}
      
      {activeTab !== "overview" && (
        <Suspense fallback={<TabLoading />}>
          {activeTab === "wallet" && <WalletTab />}
          
          {activeTab === "yield" && <YieldTab />}
          
          {activeTab === "investments" && (
            <Investments 
              userInvestments={userInvestments}
              onRefresh={refreshData}
            />
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-bgs-blue">Projets d'investissement proposés</h2>
              <p className="text-gray-600">
                Découvrez tous les projets d'investissement disponibles sur la plateforme et trouvez ceux qui correspondent à vos objectifs financiers.
              </p>
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div>
                </div>
              ) : (
                dbProjects.length > 0 ? (
                  <ProjectsList projects={dbProjects} />
                ) : (
                  <div className="text-center py-20">
                    <p className="text-gray-500">Aucun projet disponible actuellement.</p>
                  </div>
                )
              )}
            </div>
          )}
          
          {activeTab === "profile" && (
            <ProfileTab userData={userData} />
          )}

          {activeTab === "settings" && <SettingsTab />}
          
          {activeTab === "notifications" && <NotificationsTab />}
          
          {activeTab === "referral" && <ReferralTab />}
        </Suspense>
      )}
    </div>
  );
}

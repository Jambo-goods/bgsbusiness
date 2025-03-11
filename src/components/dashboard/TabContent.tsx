
import { lazy, Suspense, useEffect } from "react";
import { cn } from "@/lib/utils";
import Overview from "./Overview";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectsList from "../projects/ProjectsList";
import { projects } from "@/data/projects";

// Prefetch critical paths
const preloadWalletTab = () => import("./tabs/WalletTab");
const preloadInvestments = () => import("./Investments");

// Lazy load tabs that aren't used as frequently
const WalletTab = lazy(() => {
  // Trigger preload on import
  return preloadWalletTab();
});
const YieldTab = lazy(() => import("./tabs/YieldTab"));
const Investments = lazy(() => {
  // Trigger preload on import
  return preloadInvestments();
});
const ProfileTab = lazy(() => import("./tabs/ProfileTab"));
const OpportunitiesTab = lazy(() => import("./tabs/OpportunitiesTab"));
const SettingsTab = lazy(() => import("./tabs/SettingsTab"));
const NotificationsTab = lazy(() => import("./tabs/NotificationsTab"));

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
  }, 2000); // Delay to prioritize initial render
}

export default function TabContent({
  activeTab,
  userData,
  userInvestments,
  setActiveTab,
  refreshData
}: TabContentProps) {
  console.log("TabContent rendering with active tab:", activeTab);
  
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
            <Investments userInvestments={userInvestments} />
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-bgs-blue">Projets d'investissement proposés</h2>
              <p className="text-gray-600">
                Découvrez tous les projets d'investissement disponibles sur la plateforme et trouvez ceux qui correspondent à vos objectifs financiers.
              </p>
              <ProjectsList projects={projects} />
            </div>
          )}

          {activeTab === "opportunities" && <OpportunitiesTab />}
          
          {activeTab === "profile" && (
            <ProfileTab userData={userData} />
          )}

          {activeTab === "settings" && <SettingsTab />}
          
          {activeTab === "notifications" && <NotificationsTab />}
        </Suspense>
      )}
    </div>
  );
}

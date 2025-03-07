
import { lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import Overview from "./Overview";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectsList from "../projects/ProjectsList";
import { projects } from "@/data/projects";

// Lazy load tabs that aren't used as frequently
const WalletTab = lazy(() => import("./tabs/WalletTab"));
const CapitalTab = lazy(() => import("./tabs/CapitalTab"));
const YieldTab = lazy(() => import("./tabs/YieldTab"));
const Investments = lazy(() => import("./Investments"));
const ProfileTab = lazy(() => import("./tabs/ProfileTab"));
const InvestmentTrackingTab = lazy(() => import("./tabs/InvestmentTrackingTab"));
const SettingsTab = lazy(() => import("./tabs/SettingsTab"));
const NotificationsTab = lazy(() => import("./tabs/NotificationsTab"));

interface TabContentProps {
  activeTab: string;
  userData: any;
  userInvestments: any[];
  setActiveTab: (tab: string) => void;
  refreshData?: () => Promise<void>;
}

// Loading fallback component
const TabLoading = () => (
  <div className="w-full space-y-4 p-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-12 w-3/4" />
  </div>
);

export default function TabContent({
  activeTab,
  userData,
  userInvestments,
  setActiveTab,
  refreshData
}: TabContentProps) {
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
          
          {activeTab === "capital" && (
            <CapitalTab investmentTotal={userData.investmentTotal || 0} />
          )}
          
          {activeTab === "yield" && <YieldTab />}
          
          {activeTab === "investments" && (
            <Investments userInvestments={userInvestments} />
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-bgs-blue">Projets d'investissement proposés</h2>
              </div>
              <p className="text-gray-600">
                Découvrez tous les projets d'investissement disponibles sur la plateforme et trouvez ceux qui correspondent à vos objectifs financiers.
              </p>
              <ProjectsList projects={projects} />
            </div>
          )}
          
          {activeTab === "tracking" && (
            <InvestmentTrackingTab userInvestments={userInvestments} />
          )}
          
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

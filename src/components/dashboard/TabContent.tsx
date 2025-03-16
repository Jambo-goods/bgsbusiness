
import { lazy, Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Overview from "./Overview";
import ProjectsList from "../projects/ProjectsList";
import { fetchProjectsFromDatabase } from "@/utils/projectUtils";
import { Project } from "@/types/project";
import { toast } from "sonner";
import { fetchTransactionHistory } from "./investment-tracking/utils/fetchInvestmentData";
import TransactionHistoryCard from "./investment-tracking/components/TransactionHistoryCard";

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
const ParrainageTab = lazy(() => import("./tabs/ParrainageTab"));
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
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingKey, setLoadingKey] = useState<string>('initial'); // Used to force remount of components
  
  console.log("TabContent rendering with active tab:", activeTab);
  
  // When active tab changes, set a new key to force remount of tab components
  useEffect(() => {
    setLoadingKey(`${activeTab}-${Date.now()}`);
  }, [activeTab]);
  
  // Load projects from database only
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await fetchProjectsFromDatabase();
        setDbProjects(projects || []);
      } catch (error) {
        console.error("Error loading database projects:", error);
        toast.error("Erreur de chargement des projets", {
          description: "Impossible de charger les projets depuis la base de données."
        });
        setDbProjects([]);
      }
    };
    
    if (activeTab === "projects" || activeTab === "opportunities") {
      loadProjects();
    }
  }, [activeTab]);
  
  // Load transaction history
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        if (userData && userData.userId) {
          const transactionData = await fetchTransactionHistory(userData.userId);
          setTransactions(transactionData || []);
        }
      } catch (error) {
        console.error("Error loading transaction history:", error);
      }
    };
    
    if (activeTab === "overview") {
      loadTransactions();
    }
  }, [activeTab, userData]);
  
  // Add debug logging when tab content changes
  useEffect(() => {
    console.log(`TabContent mounted/updated with active tab: ${activeTab}`);
  }, [activeTab]);
  
  return (
    <div className="w-full mt-4">
      {activeTab === "overview" && (
        <>
          <Overview 
            userData={userData} 
            userInvestments={userInvestments}
            setActiveTab={setActiveTab}
          />
          
          {/* Display transaction history in overview */}
          <div className="mt-8">
            <TransactionHistoryCard transactions={transactions} />
          </div>
        </>
      )}
      
      {activeTab !== "overview" && (
        <div className="w-full">
          {activeTab === "wallet" && <WalletTab key={loadingKey} />}
          
          {activeTab === "yield" && <YieldTab key={loadingKey} />}
          
          {activeTab === "investments" && (
            <Investments 
              key={loadingKey}
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
              
              {dbProjects.length > 0 ? (
                <ProjectsList projects={dbProjects} />
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500">Aucun projet disponible actuellement.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "opportunities" && <OpportunitiesTab />}
          
          {activeTab === "parrainage" && <ParrainageTab />}
          
          {activeTab === "profile" && (
            <ProfileTab userData={userData} />
          )}

          {activeTab === "settings" && <SettingsTab />}
          
          {activeTab === "notifications" && <NotificationsTab />}
        </div>
      )}
    </div>
  );
}

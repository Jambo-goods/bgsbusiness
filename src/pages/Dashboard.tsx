
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { projects } from "@/data/projects";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import InvestmentsList from "@/components/dashboard/InvestmentsList";
import AccountSettings from "@/components/dashboard/AccountSettings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    investmentTotal: 7500,
    projectsCount: 3
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter user's investments (in a real app, this would be user-specific)
  const userInvestments = projects.slice(0, 3);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-bgs-blue">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgs-gray-light flex">
      {/* Mobile sidebar toggle */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
        aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white shadow-md fixed md:static z-40 h-full transition-all",
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0"
        )}
      >
        <DashboardSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isSidebarOpen={isSidebarOpen} 
        />
      </aside>
      
      {/* Main content */}
      <main className={cn(
        "flex-1 p-6 transition-all",
        isSidebarOpen ? "md:ml-0" : "md:ml-0"
      )}>
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-bgs-blue">
              Bonjour, {user.firstName} {user.lastName}
            </h1>
            <p className="text-bgs-blue/70">
              Bienvenue sur votre tableau de bord BGS Business Club
            </p>
          </header>
          
          {/* Dashboard content based on active tab */}
          {activeTab === "overview" && (
            <DashboardOverview 
              investmentTotal={dashboardData.investmentTotal}
              projectsCount={dashboardData.projectsCount}
              userInvestments={userInvestments}
              setActiveTab={setActiveTab}
            />
          )}
          
          {activeTab === "investments" && (
            <InvestmentsList userInvestments={userInvestments} />
          )}
          
          {activeTab === "settings" && (
            <AccountSettings />
          )}
        </div>
      </main>
    </div>
  );
}

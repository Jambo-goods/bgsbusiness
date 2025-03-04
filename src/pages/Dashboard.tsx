
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { projects } from "@/data/projects";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import Overview from "@/components/dashboard/Overview";
import Investments from "@/components/dashboard/Investments";
import Settings from "@/components/dashboard/Settings";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    investmentTotal: number;
    projectsCount: number;
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate fetching user data
    // In a real app, this would come from an authentication context or API
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData({
        firstName: parsedUser.firstName || "Jean",
        lastName: parsedUser.lastName || "Dupont",
        email: parsedUser.email || "jean.dupont@example.com",
        investmentTotal: 7500,
        projectsCount: 3
      });
    } else {
      // Redirect to login if no user is found
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter user's investments (in a real app, this would be user-specific)
  const userInvestments = projects.slice(0, 3);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-bgs-blue">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgs-gray-light flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-24">
        {/* Mobile sidebar toggle */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-md shadow-md"
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
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isSidebarOpen={isSidebarOpen}
            handleLogout={handleLogout}
          />
        </aside>
        
        {/* Main content */}
        <main className={cn(
          "flex-1 p-6 transition-all",
          isSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          <div className="max-w-6xl mx-auto">
            <DashboardHeader userData={userData} />
            
            {/* Dashboard content based on active tab */}
            {activeTab === "overview" && (
              <Overview 
                userData={userData} 
                userInvestments={userInvestments} 
                setActiveTab={setActiveTab} 
              />
            )}
            
            {activeTab === "investments" && (
              <Investments userInvestments={userInvestments} />
            )}
            
            {activeTab === "settings" && (
              <Settings userData={userData} />
            )}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

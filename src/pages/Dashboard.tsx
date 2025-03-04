
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
      <div className="min-h-screen bg-gradient-to-br from-bgs-gray-light to-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-bgs-orange border-t-transparent animate-spin mb-4"></div>
          <p className="text-bgs-blue font-medium">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgs-gray-light flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-20">
        {/* Mobile sidebar toggle */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-xl shadow-md border border-gray-100"
          aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isSidebarOpen ? <X size={24} className="text-bgs-blue" /> : <Menu size={24} className="text-bgs-blue" />}
        </button>
        
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed md:sticky top-20 left-0 h-[calc(100vh-5rem)] transition-all duration-300 ease-in-out z-40",
            isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0"
          )}
        >
          <div className="h-full bg-white shadow-md rounded-r-xl overflow-hidden">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              isSidebarOpen={isSidebarOpen}
              handleLogout={handleLogout}
            />
          </div>
        </aside>
        
        {/* Main content */}
        <main className={cn(
          "flex-1 p-6 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          <div className="max-w-7xl mx-auto space-y-6">
            <DashboardHeader userData={userData} />
            
            {/* Dashboard content based on active tab */}
            <div className="transition-all duration-300 ease-in-out">
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
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

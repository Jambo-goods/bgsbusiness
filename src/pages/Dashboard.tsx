
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMain from "@/components/dashboard/DashboardMain";
import MobileSidebarToggle from "@/components/dashboard/MobileSidebarToggle";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import { projects } from "@/data/projects";

export default function Dashboard() {
  // Possible activeTab values: "overview", "wallet", "capital", "yield", "investments", "tracking", "profile", "settings"
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    investmentTotal: number;
    projectsCount: number;
  } | null>(null);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate fetching user data
    // In a real app, this would come from an authentication context or API
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      // Check for recent investment
      const recentInvestment = localStorage.getItem("recentInvestment");
      let additionalInvestment = 0;
      
      if (recentInvestment) {
        const investmentData = JSON.parse(recentInvestment);
        additionalInvestment = investmentData.amount;
      }
      
      setUserData({
        firstName: parsedUser.firstName || "Jean",
        lastName: parsedUser.lastName || "Dupont",
        email: parsedUser.email || "jean.dupont@example.com",
        phone: parsedUser.phone || "+33 6 12 34 56 78",
        address: parsedUser.address || "123 Avenue des Champs-Élysées, Paris",
        investmentTotal: 7500 + additionalInvestment,
        projectsCount: 3
      });
    } else {
      // Redirect to login if no user is found
      window.location.href = "/login";
    }
    
    // Filter user's investments (in a real app, this would be user-specific)
    let investments = projects.slice(0, 3);
    
    // Check if there's a recent investment to add
    const recentInvestment = localStorage.getItem("recentInvestment");
    if (recentInvestment) {
      const investmentData = JSON.parse(recentInvestment);
      
      // Find the project in the projects list
      const project = projects.find(p => p.id === investmentData.projectId);
      
      // If the project exists and it's not already in the investments list
      if (project && !investments.some(i => i.id === project.id)) {
        // Add the project to the beginning of the list
        investments = [project, ...investments];
      }
    }
    
    setUserInvestments(investments);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!userData) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-bgs-gray-light flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-20">
        {/* Mobile sidebar toggle */}
        <MobileSidebarToggle 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        {/* Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
        
        {/* Main content */}
        <DashboardMain
          isSidebarOpen={isSidebarOpen}
          userData={userData}
          activeTab={activeTab}
          userInvestments={userInvestments}
          setActiveTab={setActiveTab}
        />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

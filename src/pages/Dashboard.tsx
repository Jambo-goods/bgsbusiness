
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMain from "@/components/dashboard/DashboardMain";
import MobileSidebarToggle from "@/components/dashboard/MobileSidebarToggle";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import { projects } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
    walletBalance: number;
  } | null>(null);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Get current session
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Redirect to login if no user is found
        navigate("/login");
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      // Fetch user investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('project_id, amount, duration, yield_rate, date, status')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (investmentsError) throw investmentsError;
      
      // Get actual project details for each investment
      let userProjects = [];
      
      if (investmentsData.length > 0) {
        // Get unique project IDs
        const projectIds = [...new Set(investmentsData.map(inv => inv.project_id))];
        
        // Fetch project details from Supabase
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds);
          
        if (projectsError) throw projectsError;
        
        // Combine with investment data
        userProjects = projectsData.map(project => {
          const investment = investmentsData.find(inv => inv.project_id === project.id);
          return {
            ...project,
            investedAmount: investment ? investment.amount : 0,
            investmentDate: investment ? investment.date : null
          };
        });
      } else {
        // If no investments, show demo projects (only in development)
        userProjects = projects.slice(0, 3);
      }
      
      // Check for recent investment to add
      const recentInvestment = localStorage.getItem("recentInvestment");
      if (recentInvestment) {
        const investmentData = JSON.parse(recentInvestment);
        
        // Find the project in the projects list
        const project = projects.find(p => p.id === investmentData.projectId);
        
        // If the project exists and it's not already in the investments list
        if (project && !userProjects.some(i => i.id === project.id)) {
          // Add the project to the beginning of the list
          userProjects = [project, ...userProjects];
        }
        
        // Remove from local storage to prevent showing again on refresh
        localStorage.removeItem("recentInvestment");
      }
      
      setUserData({
        firstName: profileData.first_name || "Jean",
        lastName: profileData.last_name || "Dupont",
        email: profileData.email || "jean.dupont@example.com",
        phone: profileData.phone || "+33 6 12 34 56 78",
        address: profileData.address || "123 Avenue des Champs-Élysées, Paris",
        investmentTotal: profileData.investment_total || 0,
        projectsCount: profileData.projects_count || 0,
        walletBalance: profileData.wallet_balance || 0
      });
      
      setUserInvestments(userProjects);
      
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return <DashboardLoading />;
  }

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
          refreshData={fetchUserData}
        />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

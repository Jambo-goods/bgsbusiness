
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardMain from "@/components/dashboard/DashboardMain";
import MobileSidebarToggle from "@/components/dashboard/MobileSidebarToggle";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import { projects } from "@/data/projects";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    
    const fetchUserData = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          navigate("/login");
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Récupérer les données de l'utilisateur depuis profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error("Profile error:", profileError);
          // For new users, we'll initialize with default values
          setUserData({
            firstName: sessionData.session.user.user_metadata?.first_name || "Nouvel",
            lastName: sessionData.session.user.user_metadata?.last_name || "Utilisateur",
            email: sessionData.session.user.email || "",
            investmentTotal: 0,
            projectsCount: 0,
            walletBalance: 0
          });
          
          // Initialize wallet balance for new users
          await supabase
            .from('profiles')
            .upsert({
              id: userId,
              first_name: sessionData.session.user.user_metadata?.first_name || "Nouvel",
              last_name: sessionData.session.user.user_metadata?.last_name || "Utilisateur",
              email: sessionData.session.user.email || "",
              investment_total: 0,
              projects_count: 0,
              wallet_balance: 0
            });
            
          setIsLoading(false);
          return;
        }
        
        // Récupérer les investissements de l'utilisateur
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select('project_id')
          .eq('user_id', userId);
          
        if (investmentsError) throw investmentsError;
        
        // Filtrer les projets pour obtenir ceux dans lesquels l'utilisateur a investi
        let userInvestmentProjects = [];
        
        if (investmentsData && investmentsData.length > 0) {
          const projectIds = investmentsData.map(inv => inv.project_id);
          userInvestmentProjects = projects.filter(p => projectIds.includes(p.id));
        }
        
        setUserData({
          firstName: profileData.first_name || "Utilisateur",
          lastName: profileData.last_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          investmentTotal: profileData.investment_total || 0,
          projectsCount: profileData.projects_count || 0,
          walletBalance: profileData.wallet_balance || 0
        });
        
        setUserInvestments(userInvestmentProjects);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        toast.error("Erreur lors du chargement des données utilisateur");
        // Don't redirect to login here as it might cause an infinite loop
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
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

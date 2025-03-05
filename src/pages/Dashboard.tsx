
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
import { toast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Si pas d'utilisateur connecté, vérifier le localStorage pour la démo
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Vérifier pour un investissement récent
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
          
          // Filtrer les investissements de l'utilisateur (dans une vraie application, ce serait spécifique à l'utilisateur)
          let investments = projects.slice(0, 3);
          
          // Vérifier s'il y a un investissement récent à ajouter
          if (recentInvestment) {
            const investmentData = JSON.parse(recentInvestment);
            
            // Trouver le projet dans la liste des projets
            const project = projects.find(p => p.id === investmentData.projectId);
            
            // Si le projet existe et qu'il n'est pas déjà dans la liste des investissements
            if (project && !investments.some(i => i.id === project.id)) {
              // Ajouter le projet au début de la liste
              investments = [project, ...investments];
            }
          }
          
          setUserInvestments(investments);
        } else {
          // Rediriger vers la connexion si aucun utilisateur n'est trouvé
          window.location.href = "/login";
        }
      } else {
        // Récupérer les données de profil depuis Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, wallet_balance')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Erreur lors de la récupération du profil:", profileError);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer votre profil.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        
        // Mettre à jour les données utilisateur
        setUserData({
          firstName: profileData.first_name || "Utilisateur",
          lastName: profileData.last_name || "",
          email: user.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          investmentTotal: profileData.investment_total || 0,
          projectsCount: profileData.projects_count || 0
        });
        
        // Récupérer les investissements de l'utilisateur
        const { data: investments, error: investmentsError } = await supabase
          .from('investments')
          .select('*, projects(*)')
          .eq('user_id', user.id);
        
        if (investmentsError) {
          console.error("Erreur lors de la récupération des investissements:", investmentsError);
        } else if (investments && investments.length > 0) {
          // Transformer les données pour correspondre au format Project
          const formattedInvestments = investments.map(inv => ({
            ...inv.projects,
            investmentAmount: inv.amount,
            investmentDate: inv.date,
            investmentStatus: inv.status
          }));
          
          setUserInvestments(formattedInvestments);
        } else {
          // Aucun investissement trouvé, utiliser des données de démo
          setUserInvestments(projects.slice(0, 3));
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement de vos données.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vous déconnecter.",
        variant: "destructive"
      });
    } else {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
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

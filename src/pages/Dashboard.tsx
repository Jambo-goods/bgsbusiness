
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
  // État initial du dashboard
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
    walletBalance?: number;
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
          
          // S'assurer que les valeurs par défaut sont à 0 si elles ne sont pas définies
          const investmentTotal = (parsedUser.investmentTotal || parsedUser.investment_total || 0) + additionalInvestment;
          const projectsCount = parsedUser.projectsCount || parsedUser.projects_count || 0;
          const walletBalance = parsedUser.wallet_balance || parsedUser.walletBalance || 0;
          
          setUserData({
            firstName: parsedUser.firstName || "Jean",
            lastName: parsedUser.lastName || "Dupont",
            email: parsedUser.email || "jean.dupont@example.com",
            phone: parsedUser.phone || "+33 6 12 34 56 78",
            address: parsedUser.address || "123 Avenue des Champs-Élysées, Paris",
            investmentTotal: investmentTotal,
            projectsCount: projectsCount,
            walletBalance: walletBalance
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
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Erreur lors de la récupération du profil:", profileError);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer votre profil.",
            variant: "destructive"
          });
          
          // Créer un profil si celui-ci n'existe pas encore
          if (profileError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                first_name: user.user_metadata?.first_name || "Utilisateur",
                last_name: user.user_metadata?.last_name || "",
                email: user.email,
                wallet_balance: 0,
                investment_total: 0,
                projects_count: 0
              });
            
            if (insertError) {
              console.error("Erreur lors de la création du profil:", insertError);
              setLoading(false);
              return;
            } else {
              // Réessayer de récupérer le profil après sa création
              return fetchUserData();
            }
          }
          
          setLoading(false);
          return;
        }
        
        // S'assurer que les valeurs numériques sont initialisées à 0 si elles sont nulles
        if (profileData.wallet_balance === null || profileData.wallet_balance === undefined) {
          await supabase
            .from('profiles')
            .update({ wallet_balance: 0 })
            .eq('id', user.id);
          
          profileData.wallet_balance = 0;
        }
        
        if (profileData.investment_total === null || profileData.investment_total === undefined) {
          await supabase
            .from('profiles')
            .update({ investment_total: 0 })
            .eq('id', user.id);
          
          profileData.investment_total = 0;
        }
        
        if (profileData.projects_count === null || profileData.projects_count === undefined) {
          await supabase
            .from('profiles')
            .update({ projects_count: 0 })
            .eq('id', user.id);
          
          profileData.projects_count = 0;
        }
        
        // Mettre à jour les données utilisateur
        setUserData({
          firstName: profileData.first_name || "Utilisateur",
          lastName: profileData.last_name || "",
          email: user.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          investmentTotal: profileData.investment_total ?? 0,
          projectsCount: profileData.projects_count ?? 0,
          walletBalance: profileData.wallet_balance ?? 0
        });
        
        // Récupérer les investissements de l'utilisateur
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select('*, project_id')
          .eq('user_id', user.id);
        
        if (investmentsError) {
          console.error("Erreur lors de la récupération des investissements:", investmentsError);
        } else if (investmentsData && investmentsData.length > 0) {
          const formattedInvestments = [];
          
          for (const inv of investmentsData) {
            // Pour chaque investissement, récupérer les informations du projet associé
            const { data: projectData } = await supabase
              .from('projects')
              .select('*')
              .eq('id', inv.project_id)
              .single();
              
            // Si le projet existe dans la base de données
            if (projectData) {
              formattedInvestments.push({
                ...projectData,
                investmentAmount: inv.amount,
                investmentDate: inv.date,
                investmentStatus: inv.status,
                yield: inv.yield_rate // Utiliser le taux réel d'investissement
              });
            } else {
              // Sinon, chercher dans les données statiques
              const staticProject = projects.find(p => p.id === inv.project_id);
              if (staticProject) {
                formattedInvestments.push({
                  ...staticProject,
                  investmentAmount: inv.amount,
                  investmentDate: inv.date,
                  investmentStatus: inv.status,
                  yield: inv.yield_rate
                });
              }
            }
          }
          
          setUserInvestments(formattedInvestments);
        } else {
          // Aucun investissement trouvé, utiliser un tableau vide
          setUserInvestments([]);
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
    
    // Configurer un abonnement en temps réel aux mises à jour
    const profileChannel = supabase
      .channel('dashboard-profile-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchUserData();
      })
      .subscribe();
    
    const investmentsChannel = supabase
      .channel('dashboard-investments-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'investments'
      }, () => {
        fetchUserData();
      })
      .subscribe();
    
    const transactionsChannel = supabase
      .channel('dashboard-transactions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions'
      }, () => {
        fetchUserData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(investmentsChannel);
      supabase.removeChannel(transactionsChannel);
    };
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

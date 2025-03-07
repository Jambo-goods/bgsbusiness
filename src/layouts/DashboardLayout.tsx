import { ReactNode, useState, useEffect } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { CircleUserRound, Menu, X, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavScroll } from "@/hooks/useNavScroll";
import { useSidebarState } from "@/hooks/useSidebarState";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  realTimeStatus?: 'connecting' | 'connected' | 'error';
}

export default function DashboardLayout({
  children,
  isSidebarOpen: propIsSidebarOpen,
  setIsSidebarOpen: propSetIsSidebarOpen,
  activeTab,
  setActiveTab,
  realTimeStatus = 'connecting'
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [internalActiveTab, setInternalActiveTab] = useState('overview');
  const isScrolled = useNavScroll();
  
  // Use our custom hook for persistent sidebar state
  const { isSidebarOpen: persistentSidebarOpen, setIsSidebarOpen: setPersistentSidebarOpen, toggleSidebar: togglePersistentSidebar } = useSidebarState();
  
  // Use provided state or persistent state
  const effectiveIsSidebarOpen = propIsSidebarOpen !== undefined ? propIsSidebarOpen : persistentSidebarOpen;
  const effectiveSetIsSidebarOpen = propSetIsSidebarOpen || setPersistentSidebarOpen;
  const effectiveActiveTab = activeTab || internalActiveTab;
  const effectiveSetActiveTab = setActiveTab || setInternalActiveTab;
  
  // Toggle function that uses the appropriate state setter
  const toggleSidebar = () => {
    if (propSetIsSidebarOpen) {
      propSetIsSidebarOpen(!propIsSidebarOpen);
    } else {
      togglePersistentSidebar();
    }
  };
  
  // Close sidebar on small screens by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && effectiveIsSidebarOpen) {
        effectiveSetIsSidebarOpen(false);
      } else if (window.innerWidth >= 1280 && !effectiveIsSidebarOpen) {
        // Auto-expand on extra large screens
        effectiveSetIsSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [effectiveIsSidebarOpen, effectiveSetIsSidebarOpen]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar isScrolled={isScrolled} />
      
      <div className="flex-1 flex flex-row pt-16">
        {/* Sidebar */}
        <DashboardSidebar
          isSidebarOpen={effectiveIsSidebarOpen}
          activeTab={effectiveActiveTab}
          setActiveTab={effectiveSetActiveTab}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 flex flex-col min-h-[calc(100vh-4rem)] transition-all duration-300",
          effectiveIsSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          {/* Top bar with toggle and user info */}
          <div className="bg-white border-b py-3 px-4 sticky top-16 z-10 flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="mr-4 text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                aria-label={effectiveIsSidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
                title={effectiveIsSidebarOpen ? "Réduire le menu (Ctrl+B)" : "Agrandir le menu (Ctrl+B)"}
              >
                {effectiveIsSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  realTimeStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
                  realTimeStatus === 'error' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500 animate-pulse'
                }`}></div>
                <span className="text-xs text-gray-500 mr-2">
                  {realTimeStatus === 'connected' ? 'Temps réel' : 
                   realTimeStatus === 'error' ? 'Hors-ligne' : 'Connexion...'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-bgs-orange rounded-full"></span>
              </button>
              <button 
                onClick={handleLogout}
                className="mr-4 text-gray-600 text-sm hover:text-bgs-blue transition-colors hidden md:block"
              >
                Déconnexion
              </button>
              <CircleUserRound className="h-8 w-8 text-bgs-blue" />
            </div>
          </div>
          
          {/* Dashboard content */}
          {children}
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

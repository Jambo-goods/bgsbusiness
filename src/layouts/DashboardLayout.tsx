
import { ReactNode, useState, useEffect } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { CircleUserRound, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavScroll } from "@/hooks/useNavScroll";

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
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  realTimeStatus = 'connecting'
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(true);
  const [internalActiveTab, setInternalActiveTab] = useState('overview');
  const isScrolled = useNavScroll();
  
  // Use provided state or internal state
  const effectiveIsSidebarOpen = isSidebarOpen !== undefined ? isSidebarOpen : internalSidebarOpen;
  const effectiveSetIsSidebarOpen = setIsSidebarOpen || setInternalSidebarOpen;
  const effectiveActiveTab = activeTab || internalActiveTab;
  const effectiveSetActiveTab = setActiveTab || setInternalActiveTab;
  
  // Close sidebar on small screens by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && effectiveIsSidebarOpen) {
        effectiveSetIsSidebarOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [effectiveIsSidebarOpen, effectiveSetIsSidebarOpen]);
  
  const toggleSidebar = () => {
    effectiveSetIsSidebarOpen(!effectiveIsSidebarOpen);
  };
  
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
      <div className="flex flex-1">
        <DashboardSidebar
          isSidebarOpen={effectiveIsSidebarOpen}
          activeTab={effectiveActiveTab}
          setActiveTab={effectiveSetActiveTab}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
        
        <div className="flex-1 flex flex-col relative">
          <header className="bg-white border-b py-3 px-4 flex justify-between items-center fixed top-0 right-0 left-0 z-20 transition-all md:left-20">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar} 
                className="mr-4 text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                aria-label={effectiveIsSidebarOpen ? "Close sidebar" : "Open sidebar"}
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
            
            <div className="flex items-center">
              <button 
                onClick={handleLogout}
                className="mr-4 text-gray-600 text-sm hover:text-bgs-blue transition-colors"
              >
                Déconnexion
              </button>
              <CircleUserRound className="h-6 w-6 text-bgs-blue" />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}

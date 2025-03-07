import { ReactNode, useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavScroll } from "@/hooks/useNavScroll";
import { useSidebarState } from "@/hooks/useSidebarState";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import PageTransition from "@/components/transitions/PageTransition";

interface DashboardLayoutProps {
  children: ReactNode;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
  toggleSidebar?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  realTimeStatus?: 'connecting' | 'connected' | 'error';
  handleLogout?: () => void;
}

export default function DashboardLayout({
  children,
  isSidebarOpen: propIsSidebarOpen,
  setIsSidebarOpen: propSetIsSidebarOpen,
  toggleSidebar: propToggleSidebar,
  activeTab,
  setActiveTab,
  realTimeStatus = 'connecting',
  handleLogout: propHandleLogout
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [internalActiveTab, setInternalActiveTab] = useState('overview');
  const isScrolled = useNavScroll();
  
  const { 
    isSidebarOpen: persistentSidebarOpen, 
    setIsSidebarOpen: setPersistentSidebarOpen, 
    toggleSidebar: togglePersistentSidebar 
  } = useSidebarState();
  
  const effectiveIsSidebarOpen = propIsSidebarOpen !== undefined ? propIsSidebarOpen : persistentSidebarOpen;
  const effectiveSetIsSidebarOpen = propSetIsSidebarOpen || setPersistentSidebarOpen;
  const effectiveToggleSidebar = propToggleSidebar || togglePersistentSidebar;
  const effectiveActiveTab = activeTab || internalActiveTab;
  const effectiveSetActiveTab = setActiveTab || setInternalActiveTab;
  
  const defaultHandleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };
  
  const effectiveHandleLogout = propHandleLogout || defaultHandleLogout;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isScrolled={isScrolled} />
        
        <div className="fixed top-20 left-4 z-50 md:hidden">
          <button
            onClick={effectiveToggleSidebar}
            className="bg-white p-2 rounded-md shadow-md text-bgs-blue hover:text-bgs-orange transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-row pt-16">
          <DashboardSidebar
            isSidebarOpen={effectiveIsSidebarOpen}
            activeTab={effectiveActiveTab}
            setActiveTab={effectiveSetActiveTab}
            toggleSidebar={effectiveToggleSidebar}
            handleLogout={effectiveHandleLogout}
          />
          
          <main className={cn(
            "flex-1 flex flex-col min-h-[calc(100vh-4rem)] transition-all duration-300 p-4 md:p-6",
            effectiveIsSidebarOpen ? "md:ml-0" : "md:ml-0"
          )}>
            {children}
            
            <Footer />
          </main>
        </div>
      </div>
    </PageTransition>
  );
}

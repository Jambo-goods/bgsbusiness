
import { ReactNode, useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import MobileSidebarToggle from "../components/dashboard/MobileSidebarToggle";
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

  useEffect(() => {
    console.log("DashboardLayout rendered with activeTab:", effectiveActiveTab);
  }, [effectiveActiveTab]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isScrolled={isScrolled} isOnDashboard={true} />
      
      <MobileSidebarToggle 
        isSidebarOpen={effectiveIsSidebarOpen}
        toggleSidebar={effectiveToggleSidebar}
      />
      
      <div className="flex-1 flex flex-row pt-16">
        <DashboardSidebar
          isSidebarOpen={effectiveIsSidebarOpen}
          activeTab={effectiveActiveTab}
          setActiveTab={effectiveSetActiveTab}
          toggleSidebar={effectiveToggleSidebar}
          handleLogout={effectiveHandleLogout}
        />
        
        <main className={cn(
          "flex-1 flex flex-col min-h-[calc(100vh-4rem)] transition-all duration-300",
          "bg-gray-50/50 backdrop-blur-sm",
          "px-4 md:px-8 py-6 md:py-8",
          "max-w-7xl mx-auto w-full",
          "animate-fade-in",
          effectiveIsSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

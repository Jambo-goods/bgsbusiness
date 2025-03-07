
import { ReactNode, useState, useEffect } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import Footer from "../components/layout/Footer";
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
  
  // Use our custom hook for persistent sidebar state
  const { 
    isSidebarOpen: persistentSidebarOpen, 
    setIsSidebarOpen: setPersistentSidebarOpen, 
    toggleSidebar: togglePersistentSidebar 
  } = useSidebarState();
  
  // Use provided state or persistent state
  const effectiveIsSidebarOpen = propIsSidebarOpen !== undefined ? propIsSidebarOpen : persistentSidebarOpen;
  const effectiveSetIsSidebarOpen = propSetIsSidebarOpen || setPersistentSidebarOpen;
  const effectiveToggleSidebar = propToggleSidebar || togglePersistentSidebar;
  const effectiveActiveTab = activeTab || internalActiveTab;
  const effectiveSetActiveTab = setActiveTab || setInternalActiveTab;
  
  // Default logout handler if none provided
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-row pt-16">
        {/* Sidebar */}
        <DashboardSidebar
          isSidebarOpen={effectiveIsSidebarOpen}
          activeTab={effectiveActiveTab}
          setActiveTab={effectiveSetActiveTab}
          toggleSidebar={effectiveToggleSidebar}
          handleLogout={effectiveHandleLogout}
        />
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 flex flex-col min-h-[calc(100vh-4rem)] transition-all duration-300 p-4 md:p-6",
          effectiveIsSidebarOpen ? "md:ml-0" : "md:ml-0"
        )}>
          {/* Dashboard content */}
          {children}
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

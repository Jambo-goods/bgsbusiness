
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
          {/* The top bar div has been removed from here */}
          
          {/* Dashboard content */}
          {children}
          
          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

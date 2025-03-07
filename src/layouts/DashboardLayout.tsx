
import { ReactNode, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { CircleUserRound, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Use provided state or internal state
  const effectiveIsSidebarOpen = isSidebarOpen !== undefined ? isSidebarOpen : internalSidebarOpen;
  const effectiveSetIsSidebarOpen = setIsSidebarOpen || setInternalSidebarOpen;
  const effectiveActiveTab = activeTab || internalActiveTab;
  const effectiveSetActiveTab = setActiveTab || setInternalActiveTab;
  
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
    <div className="flex flex-col min-h-screen">
      {/* Add Navbar to the top */}
      <Navbar />
      
      <div className="flex-1 flex flex-col md:flex-row mt-20">
        <DashboardSidebar
          isSidebarOpen={effectiveIsSidebarOpen}
          activeTab={effectiveActiveTab}
          setActiveTab={effectiveSetActiveTab}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b p-4 flex justify-between items-center sticky top-20 z-10">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="mr-4 text-gray-600">
                {effectiveIsSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
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
          
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      
      {/* Add Footer to the bottom */}
      <Footer />
    </div>
  );
}


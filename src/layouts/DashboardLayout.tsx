
import { ReactNode } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { CircleUserRound, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DashboardLayoutProps {
  children: ReactNode;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
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
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="mr-4 text-gray-600">
              {isSidebarOpen ? (
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
  );
}

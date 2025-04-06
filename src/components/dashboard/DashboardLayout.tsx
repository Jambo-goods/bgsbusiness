
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileSidebarToggle from "@/components/dashboard/MobileSidebarToggle";
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  userData: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  realTimeStatus?: string;
  handleLogout?: () => Promise<void>;
  children: ReactNode; // Add children prop
}

export default function DashboardLayout({ 
  userData, 
  activeTab, 
  setActiveTab,
  isSidebarOpen,
  toggleSidebar,
  realTimeStatus,
  handleLogout,
  children
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-bgs-gray-light flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        {/* Mobile sidebar toggle */}
        <MobileSidebarToggle 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
        
        {/* Real-time status indicator - Mobile optimized */}
        {realTimeStatus && (
          <div className="fixed bottom-4 right-4 flex items-center bg-white p-2 rounded-lg shadow-md z-50">
            <div className={`h-2 w-2 rounded-full mr-2 animate-pulse ${
              realTimeStatus === 'connected' ? 'bg-green-500' : 
              realTimeStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-xs text-gray-600">
              {realTimeStatus === 'connected' ? 'Temps réel actif' : 
              realTimeStatus === 'error' ? 'Erreur temps réel' : 'Connexion...'}
            </span>
          </div>
        )}
        
        {/* Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />
        
        {/* Main content */}
        {children}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

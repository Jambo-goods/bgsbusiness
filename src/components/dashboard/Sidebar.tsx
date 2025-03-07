
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import SidebarSection from "./SidebarSection";
import PrincipalSection from "./sections/PrincipalSection";
import AccountSection from "./sections/AccountSection";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  handleLogout: () => void;
  toggleSidebar?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  handleLogout,
  toggleSidebar
}: SidebarProps) {
  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault(); // Prevent default browser behavior
        if (toggleSidebar) {
          toggleSidebar();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleSidebar]);
  
  return (
    <div className={cn(
      "flex flex-col h-full transition-all duration-300 bg-white border-r relative overflow-y-auto", 
      isSidebarOpen ? "w-64" : "w-16"
    )}>
      {toggleSidebar && (
        <button 
          onClick={toggleSidebar}
          className={cn(
            "absolute top-4 right-0 z-10 h-8 w-8 flex items-center justify-center bg-white shadow-sm rounded-l-md -mr-4 transition-all",
            "text-bgs-blue hover:text-bgs-orange focus:outline-none",
            "md:flex hidden" // Hide on mobile, show on desktop
          )}
          aria-label={isSidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
          title={isSidebarOpen ? "Réduire le menu (Ctrl+B)" : "Agrandir le menu (Ctrl+B)"}
        >
          {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      )}
      
      <div className="flex flex-col py-4 flex-grow">
        <SidebarSection title="PRINCIPAL" expanded={isSidebarOpen}>
          <PrincipalSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={isSidebarOpen} />
        </SidebarSection>
        
        <SidebarSection title="COMPTE" expanded={isSidebarOpen}>
          <AccountSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={isSidebarOpen} handleLogout={handleLogout} />
        </SidebarSection>
      </div>
    </div>
  );
}

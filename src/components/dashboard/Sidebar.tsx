
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import SidebarSection from "./SidebarSection";
import PrincipalSection from "./sections/PrincipalSection";
import AccountSection from "./sections/AccountSection";

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
      "flex flex-col h-full transition-all duration-300 bg-white shadow-md", 
      isSidebarOpen ? "w-64" : "w-20"
    )}>
      <div className="h-16 flex items-center justify-center border-b">
        <div className={cn(
          "text-bgs-blue font-bold transition-all",
          isSidebarOpen ? "text-xl" : "text-xs"
        )}>
          {isSidebarOpen ? 'BGS Invest' : 'BGS'}
        </div>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto px-2">
        <SidebarSection title="Principal" expanded={isSidebarOpen}>
          <PrincipalSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={isSidebarOpen} />
        </SidebarSection>
        
        <SidebarSection title="Compte" expanded={isSidebarOpen}>
          <AccountSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={isSidebarOpen} handleLogout={handleLogout} />
        </SidebarSection>
      </nav>
      
      <div className="p-2 text-xs text-center text-bgs-gray-medium border-t">
        {isSidebarOpen ? 'Ctrl+B pour fermer/ouvrir' : 'Ctrl+B'}
      </div>
    </div>
  );
}

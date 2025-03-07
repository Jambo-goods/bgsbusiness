
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import SidebarSection from "./SidebarSection";
import PrincipalSection from "./sections/PrincipalSection";
import AccountSection from "./sections/AccountSection";
import { ChevronLeft } from "lucide-react";

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
      "flex flex-col h-full transition-all duration-300 bg-white shadow-md border-r", 
      isSidebarOpen ? "w-64" : "w-16"
    )}>
      {toggleSidebar && (
        <div className="flex justify-end p-2">
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-100 md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <nav className="flex-1 py-4 overflow-y-auto px-3">
        <SidebarSection title="PRINCIPAL" expanded={isSidebarOpen}>
          <PrincipalSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={isSidebarOpen} />
        </SidebarSection>
        
        <SidebarSection title="COMPTE" expanded={isSidebarOpen}>
          <AccountSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={isSidebarOpen} handleLogout={handleLogout} />
        </SidebarSection>
      </nav>
    </div>
  );
}

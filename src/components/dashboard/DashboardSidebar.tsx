
import React from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  handleLogout: () => void;
}

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  toggleSidebar,
  handleLogout
}: DashboardSidebarProps) {
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    
      <aside 
        className={cn(
          "bg-white shadow-lg fixed md:sticky top-16 md:top-16 z-40 h-[calc(100vh-4rem)] transition-all duration-300 overflow-hidden",
          isSidebarOpen 
            ? "w-72 translate-x-0" 
            : "w-0 -translate-x-full md:w-16 md:translate-x-0",
          "border-r border-gray-100"
        )}
      >
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isSidebarOpen={isSidebarOpen}
          handleLogout={handleLogout}
          toggleSidebar={toggleSidebar}
        />
      </aside>
    </>
  );
}

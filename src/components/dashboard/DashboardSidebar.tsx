
import React from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";

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
  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && (
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
            ? "w-64 translate-x-0" 
            : "w-16 md:w-16 -translate-x-0 md:translate-x-0",
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

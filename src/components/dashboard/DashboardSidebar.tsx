
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
    <aside 
      className={cn(
        "bg-white shadow-md fixed md:static z-40 h-full transition-all",
        isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-20 md:translate-x-0"
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
  );
}

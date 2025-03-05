
import { useState } from "react";
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
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-white pt-20 transition-transform duration-300 md:translate-x-0 md:pt-20",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        handleLogout={handleLogout}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
}

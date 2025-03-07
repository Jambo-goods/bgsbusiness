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
  return <>
      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={toggleSidebar} aria-hidden="true" />}
    
      
    </>;
}
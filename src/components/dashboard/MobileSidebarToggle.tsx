
import React from "react";
import { Menu, X } from "lucide-react";

interface MobileSidebarToggleProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function MobileSidebarToggle({ isSidebarOpen, toggleSidebar }: MobileSidebarToggleProps) {
  return (
    <button 
      onClick={toggleSidebar}
      className="md:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-lg border border-gray-100"
      aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
    >
      {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  );
}

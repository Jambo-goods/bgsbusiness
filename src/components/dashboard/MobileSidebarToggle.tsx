
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
      className="md:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-md shadow-md"
      aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
    >
      {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}

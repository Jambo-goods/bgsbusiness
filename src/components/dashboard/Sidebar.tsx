
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarSection from "./SidebarSection";
import PrincipalSection from "./sections/PrincipalSection";
import TransactionsSection from "./sections/TransactionsSection";
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
  const [expanded, setExpanded] = useState(true);
  
  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd+B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault(); // Prevent default browser behavior
        if (toggleSidebar) {
          toggleSidebar();
        } else {
          handleToggle();
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
      "flex flex-col h-full transition-all duration-300 bg-white shadow-sm", 
      expanded ? "w-64" : "w-20"
    )}>
      <nav className="flex-1 py-2 overflow-y-auto">
        <SidebarSection title="Principal" expanded={expanded}>
          <PrincipalSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={expanded} />
        </SidebarSection>
        
        <SidebarSection title="Transactions" expanded={expanded}>
          <TransactionsSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={expanded} />
        </SidebarSection>
        
        <SidebarSection title="Compte" expanded={expanded}>
          <AccountSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={expanded} handleLogout={handleLogout} />
        </SidebarSection>
      </nav>
      
      {/* Toggle button at the bottom */}
      <div className="p-2 border-t border-gray-100">
        <button 
          onClick={handleToggle}
          className="w-full p-2 flex items-center justify-center text-bgs-gray-medium hover:bg-gray-100 rounded-md transition-colors"
          aria-label={expanded ? "Réduire le menu" : "Agrandir le menu"}
        >
          {expanded ? (
            <ChevronLeft size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>
      </div>
    </div>
  );
}

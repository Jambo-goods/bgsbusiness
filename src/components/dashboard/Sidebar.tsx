
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      "flex flex-col h-full transition-all duration-300 bg-white shadow-md rounded-r-xl border-r", 
      expanded ? "w-64" : "w-20"
    )}>
      <nav className="flex-1 py-4 overflow-y-auto px-2">
        <SidebarSection title="Principal" expanded={expanded}>
          <PrincipalSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={expanded} />
        </SidebarSection>
        
        <SidebarSection title="Compte" expanded={expanded}>
          <AccountSection activeTab={activeTab} setActiveTab={setActiveTab} expanded={expanded} handleLogout={handleLogout} />
        </SidebarSection>
      </nav>
    </div>
  );
}

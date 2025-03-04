
import { useState } from "react";
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
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen,
  handleLogout 
}: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  
  const handleToggle = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className={cn(
      "flex flex-col h-full transition-all duration-300 bg-white shadow-sm",
      expanded ? "w-64" : "w-20"
    )}>
      <nav className="flex-1 py-2 overflow-y-auto">
        <SidebarSection title="Principal" expanded={expanded}>
          <PrincipalSection 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            expanded={expanded}
          />
        </SidebarSection>
        
        <SidebarSection title="Transactions" expanded={expanded}>
          <TransactionsSection 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            expanded={expanded}
          />
        </SidebarSection>
        
        <SidebarSection title="Compte" expanded={expanded}>
          <AccountSection 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            expanded={expanded}
            handleLogout={handleLogout}
          />
        </SidebarSection>
      </nav>
      
      {/* Toggle button at the bottom */}
      <div className="py-3 px-4 border-t border-gray-100">
        <button 
          onClick={handleToggle}
          className="p-1.5 rounded-full hover:bg-gray-100 text-bgs-gray-medium w-full flex justify-center"
          aria-label={expanded ? "Réduire" : "Agrandir"}
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  );
}

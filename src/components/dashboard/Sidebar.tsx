
import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Briefcase, Settings, LogOut, ChevronLeft, ChevronRight, Wallet, Users, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
      "flex flex-col h-full transition-all duration-300 border-r border-gray-100",
      expanded ? "w-64" : "w-20"
    )}>
      <div className="flex justify-between items-center px-4 py-6">
        {expanded ? (
          <Link to="/" className="flex items-center">
            <img 
              src="lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png" 
              alt="BGS Business Club" 
              className="h-10 w-auto"
            />
          </Link>
        ) : (
          <div className="mx-auto">
            <div className="h-10 w-10 rounded-full bg-bgs-blue flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
          </div>
        )}
        
        <button 
          onClick={handleToggle}
          className="p-1 rounded-full hover:bg-gray-100 text-bgs-gray-medium"
          aria-label={expanded ? "Réduire" : "Agrandir"}
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 py-4">
        <div className={expanded ? "px-3 mb-2" : "px-2 mb-2"}>
          {expanded && (
            <p className="text-xs font-semibold text-bgs-gray-medium uppercase tracking-wider px-4 mb-1">
              Principal
            </p>
          )}
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                  activeTab === "overview" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <LayoutDashboard size={20} className={expanded ? "mr-3" : "mx-auto"} />
                {expanded && <span>Tableau de bord</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("investments")}
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                  activeTab === "investments" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <Briefcase size={20} className={expanded ? "mr-3" : "mx-auto"} />
                {expanded && <span>Investissements</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => {}}
                className="flex items-center w-full px-4 py-3 rounded-lg transition-colors text-bgs-blue hover:bg-bgs-gray-light"
              >
                <Wallet size={20} className={expanded ? "mr-3" : "mx-auto"} />
                {expanded && <span>Portefeuille</span>}
              </button>
            </li>
          </ul>
        </div>
        
        {expanded && (
          <div className="px-3 mb-2">
            <p className="text-xs font-semibold text-bgs-gray-medium uppercase tracking-wider px-4 mb-1 mt-4">
              Communauté
            </p>
          </div>
        )}
        
        <div className={expanded ? "px-3 mb-2" : "px-2 mb-2"}>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => {}}
                className="flex items-center w-full px-4 py-3 rounded-lg transition-colors text-bgs-blue hover:bg-bgs-gray-light"
              >
                <Users size={20} className={expanded ? "mr-3" : "mx-auto"} />
                {expanded && <span>Réseau</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => {}}
                className="flex items-center w-full px-4 py-3 rounded-lg transition-colors text-bgs-blue hover:bg-bgs-gray-light"
              >
                <HelpCircle size={20} className={expanded ? "mr-3" : "mx-auto"} />
                {expanded && <span>Aide</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                  activeTab === "settings" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <Settings size={20} className={expanded ? "mr-3" : "mx-auto"} />
                {expanded && <span>Paramètres</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className={expanded ? "px-3 mb-6" : "px-2 mb-6"}>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className={expanded ? "mr-3" : "mx-auto"} />
          {expanded && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}

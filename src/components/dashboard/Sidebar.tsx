
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  List, 
  History, 
  Upload
} from "lucide-react";
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
      "flex flex-col h-full transition-all duration-300 bg-white shadow-sm",
      expanded ? "w-64" : "w-20"
    )}>
      <nav className="flex-1 py-2 overflow-y-auto">
        <div className={expanded ? "px-2 mb-1" : "px-1 mb-1"}>
          {expanded && (
            <p className="text-xs font-medium text-bgs-gray-medium uppercase tracking-wider px-3 mb-1 mt-2">
              Principal
            </p>
          )}
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "overview" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <LayoutDashboard size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Tableau de bord</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("wallet")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "wallet" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <Wallet size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Solde disponible</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("capital")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "capital" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <TrendingUp size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Capital investi</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("yield")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "yield" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <BarChart3 size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Rendement mensuel</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("investments")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "investments" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <Briefcase size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Investissements</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("activeList")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "activeList" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <List size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Investissements actifs</span>}
              </button>
            </li>
          </ul>
        </div>
        
        {expanded && (
          <div className="px-2 mb-1">
            <p className="text-xs font-medium text-bgs-gray-medium uppercase tracking-wider px-3 mb-1 mt-3">
              Transactions
            </p>
          </div>
        )}
        
        <div className={expanded ? "px-2 mb-1" : "px-1 mb-1"}>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "history" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <History size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Historique</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("transfers")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "transfers" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <Upload size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Dépôt & Retrait</span>}
              </button>
            </li>
          </ul>
        </div>

        {expanded && (
          <div className="px-2 mb-1">
            <p className="text-xs font-medium text-bgs-gray-medium uppercase tracking-wider px-3 mb-1 mt-3">
              Compte
            </p>
          </div>
        )}
        
        <div className={expanded ? "px-2 mb-1" : "px-1 mb-1"}>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors",
                  activeTab === "settings" 
                    ? "bg-bgs-blue text-white" 
                    : "text-bgs-blue hover:bg-bgs-gray-light"
                )}
              >
                <Settings size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Paramètres</span>}
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} className={expanded ? "mr-2" : "mx-auto"} />
                {expanded && <span>Déconnexion</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Add a toggle button at the bottom to replace the removed header toggle */}
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

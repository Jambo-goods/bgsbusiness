
import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Briefcase, Settings, LogOut } from "lucide-react";
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
  return (
    <div className="flex flex-col h-full py-6">
      <div className="flex justify-center mb-8">
        <Link to="/">
          <img 
            src="lovable-uploads/d9a3204a-06aa-470d-8255-7f3bd0852557.png" 
            alt="BGS Business Club" 
            className="h-12 w-auto"
          />
        </Link>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1 px-2">
          <li>
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                activeTab === "overview" 
                  ? "bg-bgs-orange text-white" 
                  : "text-bgs-blue hover:bg-bgs-gray-light"
              )}
            >
              <LayoutDashboard size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
              {isSidebarOpen && <span>Aperçu</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("investments")}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                activeTab === "investments" 
                  ? "bg-bgs-orange text-white" 
                  : "text-bgs-blue hover:bg-bgs-gray-light"
              )}
            >
              <Briefcase size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
              {isSidebarOpen && <span>Mes investissements</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-lg transition-colors",
                activeTab === "settings" 
                  ? "bg-bgs-orange text-white" 
                  : "text-bgs-blue hover:bg-bgs-gray-light"
              )}
            >
              <Settings size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
              {isSidebarOpen && <span>Paramètres</span>}
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="px-2 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} className={isSidebarOpen ? "mr-3" : "mx-auto"} />
          {isSidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}

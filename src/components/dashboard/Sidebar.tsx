
import React from "react";
import { 
  User, 
  Bell, 
  Home, 
  Settings, 
  LogOut, 
  ChevronRight,
  Wallet,
  LineChart,
  BarChart3,
  Briefcase,
  Sparkles,
  Users
} from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";
import SidebarSection from "./SidebarSection";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  handleLogout: () => void;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  handleLogout,
  toggleSidebar
}) => {
  return (
    <div className="h-full flex flex-col justify-between py-4 overflow-y-auto">
      {/* Main Navigation */}
      <div className="flex-1 px-3 py-2 space-y-6">
        <SidebarSection title="Tableau de bord">
          <SidebarNavItem 
            icon={<Home size={20} />}
            label="Vue d'ensemble"
            isActive={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            isOpen={isSidebarOpen}
          />
          
          <SidebarNavItem 
            icon={<Wallet size={20} />}
            label="Portefeuille"
            isActive={activeTab === "wallet"}
            onClick={() => setActiveTab("wallet")}
            isOpen={isSidebarOpen}
          />
          
          <SidebarNavItem 
            icon={<LineChart size={20} />}
            label="Rendements"
            isActive={activeTab === "yield"}
            onClick={() => setActiveTab("yield")}
            isOpen={isSidebarOpen}
          />
        
          {/* Investment items (without the section header) */}
          <SidebarNavItem 
            icon={<BarChart3 size={20} />}
            label="Mes investissements"
            isActive={activeTab === "investments"}
            onClick={() => setActiveTab("investments")}
            isOpen={isSidebarOpen}
          />
          
          <SidebarNavItem 
            icon={<Briefcase size={20} />}
            label="Projets"
            isActive={activeTab === "projects"}
            onClick={() => setActiveTab("projects")}
            isOpen={isSidebarOpen}
            badge="Nouveau"
            badgeColor="bg-green-500"
          />
          
          <SidebarNavItem 
            icon={<Sparkles size={20} />}
            label="Opportunités"
            isActive={activeTab === "opportunities"}
            onClick={() => setActiveTab("opportunities")}
            isOpen={isSidebarOpen}
            badge="Hot"
            badgeColor="bg-red-500"
          />
        
          {/* Program items (without the section header) */}
          <SidebarNavItem 
            icon={<Users size={20} />}
            label="Parrainage"
            isActive={activeTab === "referral"}
            onClick={() => setActiveTab("referral")}
            isOpen={isSidebarOpen}
            badge="10%"
            badgeColor="bg-amber-500"
          />
        </SidebarSection>
      </div>
      
      {/* User Navigation */}
      <div className="px-3 py-2 border-t border-gray-100 space-y-1">
        <SidebarNavItem 
          icon={<User size={20} />}
          label="Mon Profil"
          isActive={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
          isOpen={isSidebarOpen}
        />
        
        <SidebarNavItem 
          icon={<Bell size={20} />}
          label="Notifications"
          isActive={activeTab === "notifications"}
          onClick={() => setActiveTab("notifications")}
          isOpen={isSidebarOpen}
        />
        
        <SidebarNavItem 
          icon={<Settings size={20} />}
          label="Paramètres"
          isActive={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          isOpen={isSidebarOpen}
        />
        
        <SidebarNavItem 
          icon={<LogOut size={20} />}
          label="Déconnexion"
          isActive={false}
          onClick={handleLogout}
          isOpen={isSidebarOpen}
        />
      </div>
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden px-3 pt-2 border-t border-gray-100">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-bgs-blue hover:bg-bgs-blue/5 rounded-md transition-colors"
        >
          <span>Fermer le menu</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React from "react";
import SidebarSection from "./SidebarSection";
import SidebarNavItem from "./SidebarNavItem";
import { 
  Home, 
  User, 
  Wallet, 
  Bell,
  Settings, 
  LineChart,
  LogOut,
  Menu,
  ShieldCheck
} from "lucide-react";
import { Button } from "../ui/button";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  handleLogout?: () => void;
  toggleSidebar?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen,
  handleLogout,
  toggleSidebar
}: SidebarProps) {
  // Function to check if user has admin rights (simplified for now)
  const isAdmin = true; // This should be replaced with actual admin check

  return (
    <div className="h-full flex flex-col p-3">
      {/* Mobile Menu Toggle Button */}
      {toggleSidebar && (
        <div className="flex justify-end md:hidden mb-4">
          <Button variant="ghost" size="sm" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Logo or Brand Name - only show when sidebar is open */}
      {isSidebarOpen && (
        <div className="flex items-center mb-4 h-12 px-3">
          <span className="font-bold text-bgs-blue text-xl">BGS Invest</span>
        </div>
      )}
      
      <SidebarSection title={isSidebarOpen ? "Navigation" : ""}>
        <SidebarNavItem 
          icon={<Home className="h-5 w-5" />} 
          label="Dashboard" 
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          expanded={isSidebarOpen}
        />
        <SidebarNavItem 
          icon={<User className="h-5 w-5" />} 
          label="Profil" 
          active={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
          expanded={isSidebarOpen}
        />
        <SidebarNavItem 
          icon={<LineChart className="h-5 w-5" />} 
          label="Suivi des investissements" 
          active={activeTab === "tracking"}
          onClick={() => setActiveTab("tracking")}
          expanded={isSidebarOpen}
        />
        <SidebarNavItem 
          icon={<Wallet className="h-5 w-5" />} 
          label="Portefeuille" 
          active={activeTab === "wallet"}
          onClick={() => setActiveTab("wallet")}
          expanded={isSidebarOpen}
        />
        <SidebarNavItem 
          icon={<Bell className="h-5 w-5" />} 
          label="Notifications" 
          active={activeTab === "notifications"}
          onClick={() => setActiveTab("notifications")}
          expanded={isSidebarOpen}
        />
      </SidebarSection>
      
      <SidebarSection title={isSidebarOpen ? "Préférences" : ""}>
        <SidebarNavItem 
          icon={<Settings className="h-5 w-5" />} 
          label="Paramètres" 
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          expanded={isSidebarOpen}
        />
      </SidebarSection>

      {/* Admin section - only visible for admin users */}
      {isAdmin && (
        <SidebarSection title={isSidebarOpen ? "Administration" : ""}>
          <SidebarNavItem 
            icon={<ShieldCheck className="h-5 w-5" />} 
            label="Admin Dashboard" 
            active={activeTab === "admin"}
            onClick={() => setActiveTab("admin")}
            expanded={isSidebarOpen}
          />
        </SidebarSection>
      )}
      
      <div className="mt-auto pt-6">
        {handleLogout && (
          <SidebarNavItem 
            icon={<LogOut className="h-5 w-5" />} 
            label="Déconnexion" 
            active={false}
            onClick={handleLogout}
            expanded={isSidebarOpen}
          />
        )}
      </div>
    </div>
  );
}

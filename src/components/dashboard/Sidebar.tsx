
import React from "react";
import { LogOut, BarChart2, Wallet, LineChart, PieChart, Settings, User } from "lucide-react";
import SidebarSection from "./SidebarSection";
import SidebarNavItem from "./SidebarNavItem";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  handleLogout: () => void;
  toggleSidebar: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen,
  handleLogout,
  toggleSidebar
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto overscroll-contain py-4">
      {/* Principal Section */}
      <SidebarSection title="Principal" expanded={isSidebarOpen}>
        <SidebarNavItem
          icon={BarChart2}
          label="Vue d'ensemble"
          isActive={activeTab === "overview"}
          expanded={isSidebarOpen}
          onClick={() => setActiveTab("overview")}
        />
        <SidebarNavItem
          icon={Wallet}
          label="Portefeuille"
          isActive={activeTab === "wallet"}
          expanded={isSidebarOpen}
          onClick={() => setActiveTab("wallet")}
        />
      </SidebarSection>

      {/* Investments Section */}
      <SidebarSection title="Investissements" expanded={isSidebarOpen}>
        <SidebarNavItem
          icon={LineChart}
          label="Capital"
          isActive={activeTab === "capital"}
          expanded={isSidebarOpen}
          onClick={() => setActiveTab("capital")}
        />
        <SidebarNavItem
          icon={LineChart}
          label="Rendement"
          isActive={activeTab === "yield"}
          expanded={isSidebarOpen}
          onClick={() => setActiveTab("yield")}
        />
        <SidebarNavItem
          icon={BarChart2}
          label="Mes investissements"
          isActive={activeTab === "investments"}
          expanded={isSidebarOpen}
          onClick={() => setActiveTab("investments")}
        />
        <SidebarNavItem
          icon={PieChart}
          label="Suivi des revenus"
          isActive={activeTab === "tracking"}
          expanded={isSidebarOpen}
          onClick={() => setActiveTab("tracking")}
        />
      </SidebarSection>

      {/* Account Section */}
      <SidebarSection title="Compte" expanded={isSidebarOpen}>
        <SidebarNavItem
          icon={User}
          label="Profil"
          isActive={activeTab === "profile"}
          expanded={isSidebarOpen}
          onClick={() => setActiveTab("profile")}
        />
        <SidebarNavItem
          icon={Settings}
          label="Paramètres"
          isActive={activeTab === "settings"}
          expanded={isSidebarOpen}
          onClick={() => setActiveTab("settings")}
        />
        <SidebarNavItem
          icon={LogOut}
          label="Déconnexion"
          isActive={false}
          expanded={isSidebarOpen}
          onClick={handleLogout}
          variant="danger"
        />
      </SidebarSection>
    </div>
  );
}

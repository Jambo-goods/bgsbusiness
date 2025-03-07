
import React from "react";
import { Settings, LogOut, UserCircle, LineChart } from "lucide-react";
import SidebarNavItem from "../SidebarNavItem";

interface AccountSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expanded: boolean;
  handleLogout: () => void;
}

export default function AccountSection({ 
  activeTab, 
  setActiveTab, 
  expanded,
  handleLogout 
}: AccountSectionProps) {
  return (
    <>
      <SidebarNavItem
        icon={<LineChart size={18} />}
        label="Suivi des rendements"
        active={activeTab === "tracking"}
        expanded={expanded}
        onClick={() => setActiveTab("tracking")}
      />
      <SidebarNavItem
        icon={<UserCircle size={18} />}
        label="Profil"
        active={activeTab === "profile"}
        expanded={expanded}
        onClick={() => setActiveTab("profile")}
      />
      <SidebarNavItem
        icon={<Settings size={18} />}
        label="Paramètres"
        active={activeTab === "settings"}
        expanded={expanded}
        onClick={() => setActiveTab("settings")}
      />
      <SidebarNavItem
        icon={<LogOut size={18} />}
        label="Déconnexion"
        active={false}
        expanded={expanded}
        onClick={handleLogout}
      />
    </>
  );
}

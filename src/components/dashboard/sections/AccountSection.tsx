
import { Settings, LogOut } from "lucide-react";
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
        icon={Settings}
        label="Paramètres"
        isActive={activeTab === "settings"}
        expanded={expanded}
        onClick={() => setActiveTab("settings")}
      />
      <SidebarNavItem
        icon={LogOut}
        label="Déconnexion"
        isActive={false}
        expanded={expanded}
        onClick={handleLogout}
        variant="danger"
      />
    </>
  );
}

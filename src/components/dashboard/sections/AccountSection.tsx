
import { memo } from "react";
import { Settings, LogOut, UserCircle, LineChart } from "lucide-react";
import SidebarNavItem from "../SidebarNavItem";

interface AccountSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expanded: boolean;
  handleLogout: () => void;
}

const AccountSection = memo(({ 
  activeTab, 
  setActiveTab, 
  expanded,
  handleLogout 
}: AccountSectionProps) => {
  return (
    <>
      <SidebarNavItem
        icon={LineChart}
        label="Suivi des rendements"
        isActive={activeTab === "tracking"}
        expanded={expanded}
        onClick={() => setActiveTab("tracking")}
      />
      <SidebarNavItem
        icon={UserCircle}
        label="Profil"
        isActive={activeTab === "profile"}
        expanded={expanded}
        onClick={() => setActiveTab("profile")}
      />
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
});

AccountSection.displayName = "AccountSection";

export default AccountSection;

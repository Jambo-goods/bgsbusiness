
import React from "react";
import { LogOut, User, Settings, Bell } from "lucide-react";
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
      <li>
        <SidebarNavItem
          icon={User}
          label="Profil"
          value="profile"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <SidebarNavItem
          icon={Settings}
          label="Paramètres"
          value="settings"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <SidebarNavItem
          icon={Bell}
          label="Notifications"
          value="notifications"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-2 px-3 my-1 rounded-lg text-left transition-colors duration-200 text-sm font-medium hover:bg-gray-100 text-red-500"
          title={expanded ? undefined : "Déconnexion"}
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-red-500" />
          
          {expanded && (
            <span className="ml-3">
              Déconnexion
            </span>
          )}
        </button>
      </li>
    </>
  );
}

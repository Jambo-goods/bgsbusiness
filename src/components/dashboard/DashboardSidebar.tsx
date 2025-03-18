
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, Settings, User, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isSidebarOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebar?: () => void;
  handleLogout: () => void;
  userData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    investmentTotal?: number;
    projectsCount?: number;
    walletBalance?: number;
  };
}

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ icon, label, isActive, onClick }) => (
  <Button
    variant="ghost"
    className={cn(
      "justify-start px-4 py-2 w-full font-normal",
      isActive ? "bg-secondary text-bgs-blue font-semibold" : "text-bgs-blue/70 hover:text-bgs-blue"
    )}
    onClick={onClick}
  >
    <div className="flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </div>
  </Button>
);

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => (
  <div className="space-y-1">
    <h4 className="mb-2 ml-4 text-sm font-medium text-bgs-blue/70">{title}</h4>
    <div className="space-y-1">{children}</div>
  </div>
);

export default function DashboardSidebar({ 
  isSidebarOpen, 
  activeTab,
  setActiveTab,
  toggleSidebar,
  handleLogout,
  userData = {}
}: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0 md:border-r"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <span className="text-lg font-semibold text-bgs-blue">BGS Business Club</span>
      </div>

      <div className="flex flex-col justify-between h-[calc(100vh-16rem)]">
        <div className="flex-grow p-4">
          <SidebarSection title="Profil">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start px-4 py-2 w-full font-normal text-bgs-blue/70">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt={userData.firstName || 'User'} />
                      <AvatarFallback>{(userData.firstName?.charAt(0) || '') + (userData.lastName?.charAt(0) || '')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-bgs-blue">{userData.firstName} {userData.lastName}</span>
                      <span className="text-xs text-bgs-blue/70">{userData.email}</span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleTabChange("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarSection>

          <SidebarSection title="Menu Principal">
            <SidebarNavItem
              icon={<LayoutDashboard size={20} />}
              label="Tableau de bord"
              isActive={activeTab === "overview"}
              onClick={() => handleTabChange("overview")}
            />
            <SidebarNavItem
              icon={<CreditCard size={20} />}
              label="Portefeuille"
              isActive={activeTab === "wallet"}
              onClick={() => handleTabChange("wallet")}
            />
            <SidebarNavItem
              icon={<Users size={20} />}
              label="Parrainage"
              isActive={activeTab === "referral"}
              onClick={() => handleTabChange("referral")}
            />
            <SidebarNavItem
              icon={<Settings size={20} />}
              label="Paramètres"
              isActive={activeTab === "settings"}
              onClick={() => handleTabChange("settings")}
            />
          </SidebarSection>
        </div>
        <div className="p-4">
          <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
            Retour au site
          </Button>
        </div>
      </div>
    </aside>
  );
}

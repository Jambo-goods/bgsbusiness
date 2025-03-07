
import React from "react";
import SidebarNavItem from "../SidebarNavItem";
import { 
  LayoutDashboard, 
  Wallet, 
  BarChart, 
  LineChart, 
  Building2, 
  Timer
} from "lucide-react";

interface PrincipalSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expanded: boolean;
}

export default function PrincipalSection({
  activeTab,
  setActiveTab,
  expanded
}: PrincipalSectionProps) {
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-1">
      <SidebarNavItem
        icon={<LayoutDashboard size={18} />}
        label="Vue d'ensemble"
        active={activeTab === "overview"}
        onClick={() => handleTabChange("overview")}
        expanded={expanded}
      />
      
      <SidebarNavItem
        icon={<Wallet size={18} />}
        label="Portefeuille"
        active={activeTab === "wallet"}
        onClick={() => handleTabChange("wallet")}
        expanded={expanded}
      />
      
      <SidebarNavItem
        icon={<Building2 size={18} />}
        label="Investissements"
        active={activeTab === "investments"}
        onClick={() => handleTabChange("investments")}
        expanded={expanded}
      />
      
      <SidebarNavItem
        icon={<Timer size={18} />}
        label="Suivi des rendements"
        active={activeTab === "tracking"}
        onClick={() => handleTabChange("tracking")}
        expanded={expanded}
      />
      
      <SidebarNavItem
        icon={<LineChart size={18} />}
        label="Rendements"
        active={activeTab === "yield"}
        onClick={() => handleTabChange("yield")}
        expanded={expanded}
      />
      
      <SidebarNavItem
        icon={<BarChart size={18} />}
        label="Capital"
        active={activeTab === "capital"}
        onClick={() => handleTabChange("capital")}
        expanded={expanded}
      />
    </div>
  );
}

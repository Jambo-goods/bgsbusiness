
import { LayoutDashboard, Wallet, TrendingUp, Briefcase, Search } from "lucide-react";
import SidebarNavItem from "../SidebarNavItem";

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
  return (
    <div>
      <SidebarNavItem
        icon={LayoutDashboard}
        label="Vue d'ensemble"
        value="overview"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={Wallet}
        label="Portefeuille"
        value="wallet"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={TrendingUp}
        label="Rendements"
        value="yield"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={Briefcase}
        label="Investissements"
        value="investments"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={Search}
        label="Projets"
        value="projects"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
    </div>
  );
}

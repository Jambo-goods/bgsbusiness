
import { BarChart, LineChart, Briefcase, CircleDollarSign, Eye, LayoutDashboard, PercentSquare, Users } from "lucide-react";
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
    <>
      <SidebarNavItem
        icon={<LayoutDashboard size={18} />}
        label="Vue générale"
        active={activeTab === "overview"}
        expanded={expanded}
        onClick={() => setActiveTab("overview")}
      />
      <SidebarNavItem
        icon={<CircleDollarSign size={18} />}
        label="Mon portefeuille"
        active={activeTab === "wallet"}
        expanded={expanded}
        onClick={() => setActiveTab("wallet")}
      />
      <SidebarNavItem
        icon={<PercentSquare size={18} />}
        label="Rendements"
        active={activeTab === "yield"}
        expanded={expanded}
        onClick={() => setActiveTab("yield")}
      />
      <SidebarNavItem
        icon={<Briefcase size={18} />}
        label="Mes investissements"
        active={activeTab === "investments"}
        expanded={expanded}
        onClick={() => setActiveTab("investments")}
      />
      <SidebarNavItem
        icon={<Users size={18} />}
        label="Utilisateurs"
        active={activeTab === "users"}
        expanded={expanded}
        onClick={() => setActiveTab("users")}
      />
      <SidebarNavItem
        icon={<LineChart size={18} />}
        label="Suivi des retours"
        active={activeTab === "tracking"}
        expanded={expanded}
        onClick={() => setActiveTab("tracking")}
      />
      <SidebarNavItem
        icon={<Eye size={18} />}
        label="Projets disponibles"
        active={activeTab === "projects"}
        expanded={expanded}
        onClick={() => setActiveTab("projects")}
      />
      <SidebarNavItem
        icon={<BarChart size={18} />}
        label="Opportunités"
        active={activeTab === "opportunities"}
        expanded={expanded}
        onClick={() => setActiveTab("opportunities")}
        badge="New"
      />
    </>
  );
}

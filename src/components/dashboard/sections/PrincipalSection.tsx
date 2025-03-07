
import { LayoutDashboard, Wallet, TrendingUp, BarChart3, Briefcase, FileBarChart } from "lucide-react";
import SidebarNavItem from "../SidebarNavItem";

interface PrincipalSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expanded: boolean;
}

export default function PrincipalSection({ activeTab, setActiveTab, expanded }: PrincipalSectionProps) {
  const navItems = [
    { id: "overview", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "wallet", label: "Solde disponible", icon: Wallet },
    { id: "capital", label: "Capital investi", icon: TrendingUp },
    { id: "yield", label: "Rendement mensuel", icon: BarChart3 },
    { id: "investments", label: "Investissements", icon: Briefcase },
    { id: "projects", label: "Investissements proposés", icon: FileBarChart },
  ];

  return (
    <>
      {navItems.map((item) => (
        <SidebarNavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={activeTab === item.id}
          expanded={expanded}
          onClick={() => setActiveTab(item.id)}
        />
      ))}
    </>
  );
}

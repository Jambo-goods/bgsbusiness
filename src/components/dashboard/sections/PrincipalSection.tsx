
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Briefcase,
  BarChart3, 
  Award
} from "lucide-react";
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
    <div className="space-y-1 px-2">
      <SidebarNavItem
        icon={<LayoutDashboard className="h-5 w-5" />}
        label="Vue d'ensemble"
        active={activeTab === "overview"}
        onClick={() => setActiveTab("overview")}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={<Wallet className="h-5 w-5" />}
        label="Portefeuille"
        active={activeTab === "wallet"}
        onClick={() => setActiveTab("wallet")}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={<TrendingUp className="h-5 w-5" />}
        label="Rendement"
        active={activeTab === "yield"}
        onClick={() => setActiveTab("yield")}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={<Briefcase className="h-5 w-5" />}
        label="Mes investissements"
        active={activeTab === "investments"}
        onClick={() => setActiveTab("investments")}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={<Award className="h-5 w-5" />}
        label="Opportunités"
        active={activeTab === "opportunities"}
        onClick={() => setActiveTab("opportunities")}
        expanded={expanded}
        badge={3}
      />
      <SidebarNavItem
        icon={<BarChart3 className="h-5 w-5" />}
        label="Suivi"
        active={activeTab === "tracking"}
        onClick={() => setActiveTab("tracking")}
        expanded={expanded}
      />
    </div>
  );
}

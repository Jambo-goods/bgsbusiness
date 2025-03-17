
import React from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingUp, 
  Briefcase, 
  Award, 
  BarChart4,
  Calendar
} from "lucide-react";
import SidebarNavItem from "../SidebarNavItem";

interface PrincipalSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  expanded: boolean;
}

export default function PrincipalSection({ activeTab, setActiveTab, expanded }: PrincipalSectionProps) {
  return (
    <div className="flex flex-col space-y-0.5">
      <SidebarNavItem
        icon={LayoutDashboard}
        label="Tableau de bord"
        value="overview"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={Wallet}
        label="Solde disponible"
        value="wallet"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={TrendingUp}
        label="Rendement mensuel"
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
        icon={Award}
        label="Opportunités"
        value="opportunities"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={BarChart4}
        label="Historique"
        value="history"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
      <SidebarNavItem
        icon={Calendar}
        label="Paiements Programmés"
        value="scheduled-payments"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
        externalLink="/scheduled-payments"
      />
    </div>
  );
}

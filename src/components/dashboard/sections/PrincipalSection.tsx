
import React from "react";
import SidebarNavItem from "@/components/dashboard/SidebarNavItem";
import { BarChart3, Wallet, TrendingUp, Briefcase, Award } from "lucide-react";

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
    <div className="space-y-1">
      <SidebarNavItem
        icon={BarChart3}
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
        icon={Award}
        label="Opportunités"
        value="opportunities"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
    </div>
  );
}

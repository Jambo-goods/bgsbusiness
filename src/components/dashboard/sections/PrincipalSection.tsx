
import React from "react";
import SidebarNavItem from "../SidebarNavItem";
import { LayoutDashboard, Wallet, TrendingUp, Briefcase, Award, UserPlus } from "lucide-react";

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
        icon={LayoutDashboard}
        label="Tableau de bord"
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
      <SidebarNavItem
        icon={UserPlus}
        label="Parrainage"
        value="parrainage"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={expanded}
      />
    </>
  );
}

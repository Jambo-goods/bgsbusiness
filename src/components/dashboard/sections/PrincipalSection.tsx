
import React from "react";
import { LayoutDashboard, Wallet, TrendingUp, Briefcase, Activity, Award, ListChecks } from "lucide-react";
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
      <li>
        <SidebarNavItem
          icon={LayoutDashboard}
          label="Vue d'ensemble"
          value="overview"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <SidebarNavItem
          icon={Wallet}
          label="Portefeuille"
          value="wallet"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <SidebarNavItem
          icon={TrendingUp}
          label="Rendement"
          value="yield"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <SidebarNavItem
          icon={Briefcase}
          label="Investissements"
          value="investments"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <SidebarNavItem
          icon={ListChecks}
          label="Projets"
          value="projects"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <SidebarNavItem
          icon={Activity}
          label="Suivi des rendements"
          value="tracking"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
      
      <li>
        <SidebarNavItem
          icon={Award}
          label="Opportunités"
          value="opportunities"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          expanded={expanded}
        />
      </li>
    </>
  );
}

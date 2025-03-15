
import React from "react";
import OverviewTab from "./tabs/OverviewTab";
import WalletTab from "./tabs/WalletTab";
import InvestmentsTab from "./tabs/InvestmentsTab";
import YieldTab from "./tabs/YieldTab";
import OpportunitiesTab from "./tabs/OpportunitiesTab";
import ParrainageTab from "./tabs/ParrainageTab";
import SettingsTab from "./tabs/SettingsTab";
import ProfileTab from "./tabs/ProfileTab";

interface TabContentProps {
  currentTab: string;
}

const TabContent: React.FC<TabContentProps> = ({ currentTab }) => {
  switch (currentTab) {
    case "overview":
      return <OverviewTab />;
    case "wallet":
      return <WalletTab />;
    case "investments":
      return <InvestmentsTab />;
    case "yield":
      return <YieldTab />;
    case "opportunities":
      return <OpportunitiesTab />;
    case "parrainage":
      return <ParrainageTab />;
    case "settings":
      return <SettingsTab />;
    case "profile":
      return <ProfileTab />;
    default:
      return <OverviewTab />;
  }
};

export default TabContent;

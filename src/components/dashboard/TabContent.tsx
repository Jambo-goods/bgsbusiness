
import React from "react";
import Overview from "./Overview";
import ActiveListTab from "./tabs/ActiveListTab";
import HistoryTab from "./tabs/HistoryTab";
import YieldTab from "./tabs/YieldTab";
import CapitalTab from "./tabs/CapitalTab";
import NotificationsTab from "./tabs/NotificationsTab";
import OpportunitiesTab from "./tabs/OpportunitiesTab";
import ParrainageTab from "./tabs/ParrainageTab";
import ProfileTab from "./tabs/ProfileTab";
import SettingsTab from "./tabs/SettingsTab";
import WalletTab from "./tabs/WalletTab";

interface TabContentProps {
  activeTab: string;
  userData: any;
  userInvestments: any[];
  refreshData?: () => Promise<void>;
  setActiveTab?: (tab: string) => void;
}

const TabContent: React.FC<TabContentProps> = ({ 
  activeTab, 
  userData, 
  userInvestments,
  refreshData,
  setActiveTab
}) => {
  // Don't show no session message, just render the appropriate tab
  return (
    <div className="p-0 md:p-4 h-full">
      <div className="bg-transparent h-full">
        {activeTab === "overview" && <Overview userData={userData} userInvestments={userInvestments} setActiveTab={setActiveTab} />}
        {activeTab === "active-list" && <ActiveListTab userInvestments={userInvestments} />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "yield" && <YieldTab userInvestments={userInvestments} />}
        {activeTab === "capital" && <CapitalTab investmentTotal={userData?.investmentTotal || 0} />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "opportunities" && <OpportunitiesTab />}
        {activeTab === "parrainage" && <ParrainageTab />}
        {activeTab === "profile" && <ProfileTab userData={userData} />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "wallet" && <WalletTab />}
      </div>
    </div>
  );
};

export default TabContent;

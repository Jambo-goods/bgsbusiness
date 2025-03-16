
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
  refreshData: () => Promise<void>;
}

const TabContent: React.FC<TabContentProps> = ({ 
  activeTab, 
  userData, 
  userInvestments,
  refreshData
}) => {
  // Don't show no session message, just render the appropriate tab
  return (
    <div className="p-0 md:p-4 h-full">
      <div className="bg-transparent h-full">
        {activeTab === "overview" && <Overview userData={userData} userInvestments={userInvestments} />}
        {activeTab === "active-list" && <ActiveListTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "yield" && <YieldTab />}
        {activeTab === "capital" && <CapitalTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "opportunities" && <OpportunitiesTab />}
        {activeTab === "parrainage" && <ParrainageTab />}
        {activeTab === "profile" && <ProfileTab userData={userData} refreshData={refreshData} />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "wallet" && <WalletTab userData={userData} refreshWalletData={refreshData} />}
      </div>
    </div>
  );
};

export default TabContent;

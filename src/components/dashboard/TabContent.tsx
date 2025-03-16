
import React from "react";
import Overview from "./Overview";
import WalletTab from "./tabs/WalletTab";
import ProfileTab from "./tabs/ProfileTab";
import SettingsTab from "./tabs/SettingsTab";
import NotificationsTab from "./tabs/NotificationsTab";
import YieldTab from "./tabs/YieldTab";
import OpportunitiesTab from "./tabs/OpportunitiesTab";
import InvestmentTrackingPage from "./investment-tracking/InvestmentTrackingPage";
import ScheduledPaymentsTab from "./tabs/payments/ScheduledPaymentsTab";

interface TabContentProps {
  activeTab: string;
}

export default function TabContent({ activeTab }: TabContentProps) {
  return (
    <div className="p-4 md:p-6">
      {activeTab === "overview" && <Overview />}
      {activeTab === "wallet" && <WalletTab />}
      {activeTab === "yield" && <YieldTab />}
      {activeTab === "investments" && <InvestmentTrackingPage />}
      {activeTab === "opportunities" && <OpportunitiesTab />}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "payments" && <ScheduledPaymentsTab />}
    </div>
  );
}

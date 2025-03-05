
import { cn } from "@/lib/utils";
import Overview from "./Overview";
import WalletTab from "./tabs/WalletTab";
import CapitalTab from "./tabs/CapitalTab";
import YieldTab from "./tabs/YieldTab";
import Investments from "./Investments";
import ProfileTab from "./tabs/ProfileTab";
import InvestmentTrackingTab from "./tabs/InvestmentTrackingTab";
import SettingsTab from "./tabs/SettingsTab";
import ActivityFeed from "./overview/ActivityFeed";

interface TabContentProps {
  activeTab: string;
  userData: any;
  userInvestments: any[];
  setActiveTab: (tab: string) => void;
  refreshData: () => void;
}

export default function TabContent({
  activeTab,
  userData,
  userInvestments,
  setActiveTab,
  refreshData
}: TabContentProps) {
  return (
    <div className={cn("w-full")}>
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Overview 
            userData={userData} 
            userInvestments={userInvestments}
            setActiveTab={setActiveTab}
            refreshData={refreshData}
          />
          <ActivityFeed />
        </div>
      )}
      
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <WalletTab />
        </div>
      )}
      
      {activeTab === "capital" && (
        <CapitalTab investmentTotal={userData.investmentTotal || 0} />
      )}
      
      {activeTab === "yield" && (
        <YieldTab />
      )}
      
      {activeTab === "investments" && (
        <Investments userInvestments={userInvestments} refreshData={refreshData} />
      )}
      
      {activeTab === "tracking" && (
        <InvestmentTrackingTab userInvestments={userInvestments} />
      )}
      
      {activeTab === "profile" && (
        <ProfileTab userData={userData} />
      )}

      {activeTab === "settings" && (
        <SettingsTab />
      )}
    </div>
  );
}

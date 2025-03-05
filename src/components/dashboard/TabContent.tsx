
import { cn } from "@/lib/utils";
import Overview from "./Overview";
import WalletTab from "./tabs/WalletTab";
import CapitalTab from "./tabs/CapitalTab";
import YieldTab from "./tabs/YieldTab";
import Investments from "./Investments";
import TransfersTab from "./tabs/TransfersTab";
import ProfileTab from "./tabs/ProfileTab";
import InvestmentTrackingTab from "./tabs/InvestmentTrackingTab";

interface TabContentProps {
  activeTab: string;
  userData: any;
  userInvestments: any[];
  setActiveTab: (tab: string) => void;
}

export default function TabContent({
  activeTab,
  userData,
  userInvestments,
  setActiveTab
}: TabContentProps) {
  return (
    <div className={cn("w-full")}>
      {activeTab === "overview" && (
        <Overview 
          userData={userData} 
          userInvestments={userInvestments}
          setActiveTab={setActiveTab}
        />
      )}
      
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <WalletTab />
          <TransfersTab userData={userData} />
        </div>
      )}
      
      {activeTab === "capital" && (
        <CapitalTab investmentTotal={userData.investmentTotal || 0} />
      )}
      
      {activeTab === "yield" && (
        <YieldTab />
      )}
      
      {activeTab === "investments" && (
        <Investments userInvestments={userInvestments} />
      )}
      
      {activeTab === "tracking" && (
        <InvestmentTrackingTab userInvestments={userInvestments} />
      )}
      
      {activeTab === "profile" && (
        <ProfileTab userData={userData} />
      )}
    </div>
  );
}

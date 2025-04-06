
import { cn } from "@/lib/utils";
import OverviewTab from "./tabs/OverviewTab";
import WalletTab from "./tabs/WalletTab";
import InvestmentsTab from "./tabs/InvestmentsTab";
import NotificationsTab from "./tabs/NotificationsTab";
import ProfileTab from "./tabs/ProfileTab";
import SettingsTab from "./tabs/SettingsTab";
import ReferralTab from "./tabs/referral/ReferralTab";

interface DashboardMainProps {
  isSidebarOpen: boolean;
  userData: any;
  activeTab: string;
  userInvestments: any[];
  setActiveTab: (tab: string) => void;
  refreshData?: () => Promise<void>;
}

export default function DashboardMain({
  isSidebarOpen,
  userData,
  activeTab,
  userInvestments,
  setActiveTab,
  refreshData
}: DashboardMainProps) {
  return (
    <main
      className={cn(
        "flex-1 transition-all duration-200 ease-in-out pt-16 relative",
        {
          "md:ml-64": isSidebarOpen,
          "ml-0": !isSidebarOpen,
        }
      )}
    >
      <div className="px-4 py-6 md:p-8">
        {activeTab === "overview" && (
          <OverviewTab
            userData={userData}
            userInvestments={userInvestments}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "wallet" && (
          <WalletTab />
        )}
        {activeTab === "investments" && (
          <InvestmentsTab />
        )}
        {activeTab === "referral" && (
          <ReferralTab />
        )}
        {activeTab === "notifications" && (
          <NotificationsTab />
        )}
        {activeTab === "profile" && (
          <ProfileTab userData={userData} />
        )}
        {activeTab === "settings" && (
          <SettingsTab />
        )}
      </div>
    </main>
  );
}

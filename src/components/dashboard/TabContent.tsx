
import React from "react";
import Overview from "./Overview";
import ProfileTab from "./tabs/ProfileTab";
import InvestmentTrackingTab from "./tabs/InvestmentTrackingTab";
import WalletTab from "./tabs/WalletTab";
import SettingsTab from "./tabs/SettingsTab";
import NotificationsTab from "./tabs/NotificationsTab";
import AdminDashboardTab from "./tabs/AdminDashboardTab";
import { Project } from "@/types/project";

interface TabContentProps {
  activeTab: string;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    investmentTotal: number;
    projectsCount: number;
    walletBalance?: number;
  };
  userInvestments: Project[];
  setActiveTab: (tab: string) => void;
  refreshData?: () => Promise<void>;
}

export default function TabContent({ 
  activeTab, 
  userData, 
  userInvestments, 
  setActiveTab,
  refreshData
}: TabContentProps) {
  // Map tabs to their respective components
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview userData={userData} userInvestments={userInvestments} />;
      
      case "profile":
        return <ProfileTab userData={userData} />;
      
      case "tracking":
        return <InvestmentTrackingTab userInvestments={userInvestments} />;
      
      case "wallet":
        return <WalletTab userData={userData} refreshData={refreshData} />;
      
      case "notifications":
        return <NotificationsTab />;
      
      case "settings":
        return <SettingsTab />;
      
      case "admin":
        return <AdminDashboardTab />;
      
      default:
        return <Overview userData={userData} userInvestments={userInvestments} />;
    }
  };
  
  return (
    <div>
      {renderTabContent()}
    </div>
  );
}
